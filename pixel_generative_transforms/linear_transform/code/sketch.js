let imgA, imgB;
let numSteps = 20; 
let canvasW, canvasH;
let numRipples = 6; // Number of ripple sources
let ripples = [];
let randomnessFactor = 100; // Adds variation to the ripple spread

function preload() {
  imgA = loadImage("imageA.png");
  imgB = loadImage("imageB.png");
}

function setup() {
  // Resize to the **smaller** of the two images
  canvasW = min(imgA.width, imgB.width);
  canvasH = min(imgA.height, imgB.height);
  createCanvas(canvasW, canvasH);
  frameRate(1); // Slow down the frame rate to control image saving
  
  imgA.resize(canvasW, canvasH);
  imgB.resize(canvasW, canvasH);

  // Generate random ripple centers
  for (let i = 0; i < numRipples; i++) {
    ripples.push(createVector(random(canvasW), random(canvasH)));
  }
}

function draw() {
  let step = frameCount - 1;  // Start counting from step 0
  
  if (step < numSteps) {
    saveTransitionFrames(step);  // Call to save images step by step
  }
}

function saveTransitionFrames(step) {
  let currentImg = imgA.get(); // Start with image A
  applyDataTransformation(currentImg, imgB, step);  // Apply data transformation instead of just copying pixels
  image(currentImg, 0, 0);
  saveCanvas(`step_${nf(step, 3)}.png`); // Save the canvas as image
}

function applyDataTransformation(targetImg, sourceImg, step) {
  targetImg.loadPixels();
  sourceImg.loadPixels();

  let maxRadius = dist(0, 0, canvasW, canvasH) / 2;
  let radiusStep = maxRadius / numSteps * 0.7; // Slower expansion of ripples

  for (let y = 0; y < canvasH; y++) {
    for (let x = 0; x < canvasW; x++) {
      let reveal = false;

      // Check against all ripple sources
      for (let ripple of ripples) {
        let d = dist(x, y, ripple.x, ripple.y);
        let waveEffect = sin(d * 0.05 + step * 0.1) * 20; // Creates ripple distortions
        let randomness = random(-randomnessFactor, randomnessFactor); // Add randomness
        if (d + waveEffect + randomness < step * radiusStep) {
          reveal = true;
          break;
        }
      }

      if (reveal) {
        let index = (y * canvasW + x) * 4;

        // Convert pixel data into numbers
        let targetPixelData = {
          r: targetImg.pixels[index],
          g: targetImg.pixels[index + 1],
          b: targetImg.pixels[index + 2],
          a: targetImg.pixels[index + 3],
        };
        let sourcePixelData = {
          r: sourceImg.pixels[index],
          g: sourceImg.pixels[index + 1],
          b: sourceImg.pixels[index + 2],
          a: sourceImg.pixels[index + 3],
        };

        // Apply numerical transformation (e.g., linear interpolation)
        targetPixelData.r = lerp(targetPixelData.r, sourcePixelData.r, step / numSteps);
        targetPixelData.g = lerp(targetPixelData.g, sourcePixelData.g, step / numSteps);
        targetPixelData.b = lerp(targetPixelData.b, sourcePixelData.b, step / numSteps);
        targetPixelData.a = lerp(targetPixelData.a, sourcePixelData.a, step / numSteps);
        
        // Convert the transformed data back to pixel format
        targetImg.pixels[index] = targetPixelData.r;
        targetImg.pixels[index + 1] = targetPixelData.g;
        targetImg.pixels[index + 2] = targetPixelData.b;
        targetImg.pixels[index + 3] = targetPixelData.a;
      }
    }
  }

  targetImg.updatePixels();
}
