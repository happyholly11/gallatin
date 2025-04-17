let imgA, imgB;
let numSteps = 50;
let canvasW, canvasH;

function preload() {
  imgA = loadImage("imageA.png");
  imgB = loadImage("imageB.png");
}

function setup() {
  canvasW = min(imgA.width, imgB.width);
  canvasH = min(imgA.height, imgB.height);
  createCanvas(canvasW, canvasH);
  frameRate(1); // Slow transition to observe changes

  imgA.resize(canvasW, canvasH);
  imgB.resize(canvasW, canvasH);
}

function draw() {
  let step = frameCount - 1;

  if (step < numSteps) {
    saveTransitionFrames(step);
  }
}

function saveTransitionFrames(step) {
  let currentImg = imgA.get(); // Start with imgA
  applyDecomposingTransition(currentImg, step);
  image(currentImg, 0, 0);
  saveCanvas(`step_${nf(step, 3)}.png`);
}

function applyDecomposingTransition(targetImg, step) {
  targetImg.loadPixels();
  imgB.loadPixels();

  let progress = step / (numSteps - 1); // Linear interpolation factor (0 to 1)
  let noiseStrength = step * 1.5; // Increase noise intensity over time

  for (let y = 0; y < canvasH; y++) {
    for (let x = 0; x < canvasW; x++) {
      let pixelIndex = (y * canvasW + x) * 4;

      // Ensure pixel index is within bounds
      if (pixelIndex < 0 || pixelIndex >= targetImg.pixels.length) continue;

      // Get pixel from imgA and imgB, with safe fallback values
      let colA = [
        imgA.pixels[pixelIndex] || 0,
        imgA.pixels[pixelIndex + 1] || 0,
        imgA.pixels[pixelIndex + 2] || 0,
        imgA.pixels[pixelIndex + 3] || 255
      ];
      let colB = [
        imgB.pixels[pixelIndex] || 0,
        imgB.pixels[pixelIndex + 1] || 0,
        imgB.pixels[pixelIndex + 2] || 0,
        imgB.pixels[pixelIndex + 3] || 255
      ];

      // Linearly interpolate towards imgB
      let r = lerp(colA[0], colB[0], progress);
      let g = lerp(colA[1], colB[1], progress);
      let b = lerp(colA[2], colB[2], progress);
      let a = lerp(colA[3], colB[3], progress);

      // Wild Perlin noise-based offsets
      let noiseOffsetX = noise(x * 0.02, y * 0.02, step * 0.1) * noiseStrength - noiseStrength / 2;
      let noiseOffsetY = noise(x * 0.03, y * 0.03, step * 0.1) * noiseStrength - noiseStrength / 2;

      // Move pixels randomly based on noise
      let newX = constrain(int(x + noiseOffsetX), 0, canvasW - 1);
      let newY = constrain(int(y + noiseOffsetY), 0, canvasH - 1);
      let newPixelIndex = (newY * canvasW + newX) * 4;

      // Ensure new pixel index is valid before applying noise shift
      if (newPixelIndex >= 0 && newPixelIndex < targetImg.pixels.length) {
        targetImg.pixels[pixelIndex] = targetImg.pixels[newPixelIndex];
        targetImg.pixels[pixelIndex + 1] = targetImg.pixels[newPixelIndex + 1];
        targetImg.pixels[pixelIndex + 2] = targetImg.pixels[newPixelIndex + 2];
        targetImg.pixels[pixelIndex + 3] = targetImg.pixels[newPixelIndex + 3];
      } else {
        // Otherwise, apply normal transformation
        targetImg.pixels[pixelIndex] = r;
        targetImg.pixels[pixelIndex + 1] = g;
        targetImg.pixels[pixelIndex + 2] = b;
        targetImg.pixels[pixelIndex + 3] = a;
      }
    }
  }

  targetImg.updatePixels();
}
