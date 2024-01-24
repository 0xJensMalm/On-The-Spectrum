let lineSlider,
  bendSlider,
  oscButton,
  colorButton,
  oscTypeSelect,
  paletteSelect;
let oscSpeedSlider;
let amplitudeSlider;
let oscillationPhase = 0; // Phase of oscillation
let lineWidthSlider;
let lineThickness = 2;
let lineHeight = 300;
let bgColor = 50;
let colorPalettes = {
  Modern: ["#233D4D", "#FE7F2D", "#FCCA46", "#A1C181", "#619B8A"],
  BW: ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"],
  Rainbow: [
    "#ff0000",
    "#ff7f00",
    "#ffff00",
    "#00ff00",
    "#0000ff",
    "#4b0082",
    "#9400d3",
  ],
  Bioluminary: ["#0D3B66", "#FAF0CA", "#F4D35E", "#EE964B", "#F95738"],
  Jellyfish: ["#4CC9F0", "#4361EE", "#3A0CA3", "#7209B7", "#F72585"],
};
let colorPalette = colorPalettes.Rainbow; // Default palette
let oscillate = false;
let colorShift = false;
let angle = 0;
let angleIncrement = 0.01;
let colorShiftSpeed = 0.005;
let colorShiftIndex = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  createControls();
  oscTypeSelect = createSelect().position(10, 325);
  oscTypeSelect.option("sine");
  oscTypeSelect.option("cosine");
  oscTypeSelect.option("triangle");

  paletteSelect = createSelect().position(10, 350);
  paletteSelect.option("Modern");
  paletteSelect.option("BW");
  paletteSelect.option("Rainbow");
  paletteSelect.option("Bioluminary");
  paletteSelect.option("Jellyfish");
  paletteSelect.changed(updatePalette);
}

function draw() {
  background(bgColor);
  updateOscillation();
  updateColorShift();
  drawLines();

  // Reset styles before drawing text
  noStroke(); // Disable stroke for text
  fill(255); // Set text color
  textSize(12); // Set text size

  // Display the values of the sliders
  text(`Line Count: ${lineSlider.value()}`, 10, 25);
  text(`Line Height: ${lineHeightSlider.value()}`, 10, 65);
  text(`Line Width: ${lineWidthSlider.value()}`, 10, 105);
  text(`Bend Amount: ${bendSlider.value().toFixed(2)}`, 10, 145);
  text(`Amplitude: ${amplitudeSlider.value()}`, 10, 185);
  text(`Oscillation Speed: ${oscSpeedSlider.value().toFixed(2)}`, 10, 225);
}

function createControls() {
  lineSlider = createSlider(10, 200, 100, 1).position(10, 10);
  lineHeightSlider = createSlider(50, 500, 300, 10).position(10, 50);
  lineWidthSlider = createSlider(1, 10, 2, 1).position(10, 90);
  amplitudeSlider = createSlider(0, 75, 1, 1).position(10, 130); // Max amplitude 0 to 75
  bendSlider = createSlider(-75, 75, 0, 0.005).position(10, 170); // Bend range -75 to 75
  oscSpeedSlider = createSlider(0, 0.2, 0.01, 0.01).position(10, 210);
  oscButton = createButton("Toggle Oscillation")
    .position(10, 250)
    .mousePressed(toggleOscillation);
  colorButton = createButton("Toggle Color Shift")
    .position(10, 290)
    .mousePressed(toggleColorShift);
}

function updateOscillation() {
  if (oscillate) {
    let maxAmplitude = amplitudeSlider.value();
    let minAmplitude = -maxAmplitude;
    let speed = oscSpeedSlider.value();

    // Oscillation logic
    if (oscillationPhase === 0) {
      bendSlider.value(bendSlider.value() + speed);
      if (bendSlider.value() >= maxAmplitude) {
        oscillationPhase = 1;
      }
    } else {
      bendSlider.value(bendSlider.value() - speed);
      if (bendSlider.value() <= minAmplitude) {
        oscillationPhase = 0;
      }
    }

    // Constrain the bend slider value within its range
    bendSlider.value(constrain(bendSlider.value(), minAmplitude, maxAmplitude));
  }
}

function applySineOscillation() {
  bendSlider.value((sin(angle) + 1) * PI - TWO_PI);
  angle += oscSpeedSlider.value();
}

function applyCosineOscillation() {
  bendSlider.value((cos(angle) + 1) * PI - TWO_PI); // Cosine oscillation adjusted
  angle += oscSpeedSlider.value();
}

function applyTriangleOscillation() {
  // Triangle wave oscillation adjusted
  let triangleWave =
    abs(4 * (angle / TWO_PI - floor(angle / TWO_PI + 0.5))) - 1;
  bendSlider.value(triangleWave * TWO_PI - PI);
  angle += oscSpeedSlider.value();
}

function updateColorShift() {
  if (colorShift) {
    colorShiftIndex += colorShiftSpeed;
    if (colorShiftIndex >= 1) {
      let firstColor = colorPalette.shift();
      colorPalette.push(firstColor);
      colorShiftIndex %= 1; // Ensure the index stays within 0-1 range
    }
  }
}

function drawLine(index, totalLines, spacing) {
  let numColors = colorPalette.length;
  let colorStep = 1.0 / numColors;
  let adjustedIndex = (index / totalLines + colorShiftIndex) % 1;
  let colorPos = adjustedIndex / colorStep;
  let colorIndex = floor(colorPos) % numColors;
  let nextColorIndex = (colorIndex + 1) % numColors;
  let lerpAmt = colorPos - colorIndex;

  let col1 = colorPalette[colorIndex];
  let col2 = colorPalette[nextColorIndex];
  if (col1 && col2) {
    let col = lerpColor(color(col1), color(col2), lerpAmt);

    let x = spacing * index;
    let bendFactor = sin(bendSlider.value() * (index / totalLines));
    let yStart = (height - lineHeight) / 2 + bendFactor * 100;
    let yEnd = yStart + lineHeight;

    stroke(col);
    strokeWeight(lineWidthSlider.value()); // Set line width based on the slider
    line(x, yStart, x, yEnd);
  }
}

function drawLines() {
  let numLines = lineSlider.value();
  lineHeight = lineHeightSlider.value(); // Update line height based on the slider
  let spacing = width / numLines;
  for (let i = 0; i < numLines; i++) {
    drawLine(i, numLines, spacing);
  }
}

function toggleOscillation() {
  oscillate = !oscillate;
}

function toggleColorShift() {
  colorShift = !colorShift;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function updatePalette() {
  colorPalette = colorPalettes[paletteSelect.value()];
}
