/**
Customizing the Distortion
- Increase/Decrease Intensity:Modify the maxShift value.
- Inward vs. Outward Distortion: Flip the direction by using -shiftAmount.
- Change Wave Patterns:Adjust sin(distance / 10) for different waveforms:
cos() for smoother shifts.tan() for sharper deformations.
- Different Axes of Distortion: Modify the angle calculation to target specific quadrants.
**/

let img;
let numIterations = 10;
let maxShift = 50; // Maximum pixel shift from the center.
let currentIteration = 0;

function preload() {
  img = loadImage("line_drawing_face.jpeg");
}

function setup() {
  createCanvas(img.width, img.height);
  noLoop(); // Stop draw() from looping automatically
  saveShiftedImages();
}

function saveShiftedImages() {
  for (let i = 0; i < numIterations; i++) {
    let shiftedImg = radialDistortion(img, i * (maxShift / numIterations));
    image(shiftedImg, 0, 0);
    saveCanvas(`layer_${nf(i, 3)}.png`);
  }
}

function radialDistortion(src, shiftAmount) { //
  let result = createImage(src.width, src.height);
  result.loadPixels();
  src.loadPixels();
  
  let centerX = src.width / 2;
  let centerY = src.height / 2;
  
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      // Calculate distance and angle from the center
      let dx = x - centerX;
      let dy = y - centerY;
      let distance = sqrt(dx * dx + dy * dy);
      let angle = atan2(dy, dx);
      
      // Apply a radial shift (move pixels outward or inward)
      let newDistance = distance + shiftAmount * sin(distance / 10);
      
      // Calculate new pixel positions
      let newX = int(centerX + cos(angle) * newDistance);
      let newY = int(centerY + sin(angle) * newDistance);
      
      // Ensure the new coordinates are within bounds
      newX = constrain(newX, 0, src.width - 1);
      newY = constrain(newY, 0, src.height - 1);
      
      // Map original pixels to new positions
      let oldIndex = (y * src.width + x) * 4;
      let newIndex = (newY * src.width + newX) * 4;

      result.pixels[newIndex] = src.pixels[oldIndex];      // R
      result.pixels[newIndex + 1] = src.pixels[oldIndex + 1]; // G
      result.pixels[newIndex + 2] = src.pixels[oldIndex + 2]; // B
      result.pixels[newIndex + 3] = src.pixels[oldIndex + 3]; // A
    }
  }
  
  result.updatePixels();
  return result;
}
