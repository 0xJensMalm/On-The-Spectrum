let lineSlider,
  bendSlider,
  oscButton,
  colorButton,
  oscTypeSelect,
  paletteSelect;
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
  oscTypeSelect = createSelect().position(150, 10);
  oscTypeSelect.option("sine");
  oscTypeSelect.option("cosine");
  oscTypeSelect.option("triangle");

  paletteSelect = createSelect().position(150, 40);
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
}

function createControls() {
  lineSlider = createSlider(10, 200, 100, 1).position(10, 10);
  bendSlider = createSlider(-TWO_PI, TWO_PI, 0, 0.01).position(10, 40);
  oscButton = createButton("Toggle Oscillation")
    .position(10, 100)
    .mousePressed(toggleOscillation);
  colorButton = createButton("Toggle Color Shift")
    .position(10, 130)
    .mousePressed(toggleColorShift);
  lineHeightSlider = createSlider(50, 500, 300, 10).position(10, 70); // Line height slider
}

function updateOscillation() {
  if (oscillate) {
    let oscillationType = oscTypeSelect.value();
    switch (oscillationType) {
      case "sine":
        applySineOscillation();
        break;
      case "cosine":
        applyCosineOscillation();
        break;
      case "triangle":
        applyTriangleOscillation();
        break;
    }
  }
}

function applySineOscillation() {
  bendSlider.value((sin(angle) + 1) * PI - TWO_PI); // Sine oscillation adjusted
  angle += angleIncrement;
}

function applyCosineOscillation() {
  bendSlider.value((cos(angle) + 1) * PI - TWO_PI); // Cosine oscillation adjusted
  angle += angleIncrement;
}

function applyTriangleOscillation() {
  // Triangle wave oscillation adjusted
  let triangleWave =
    abs(4 * (angle / TWO_PI - floor(angle / TWO_PI + 0.5))) - 1;
  bendSlider.value(triangleWave * TWO_PI - PI);
  angle += angleIncrement;
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
  let colorIndex = floor(colorPos) % numColors; // Safeguard against invalid index
  let nextColorIndex = (colorIndex + 1) % numColors;
  let lerpAmt = colorPos - colorIndex;

  let col1 = colorPalette[colorIndex];
  let col2 = colorPalette[nextColorIndex];
  if (col1 && col2) {
    // Check if both colors are valid
    let col = lerpColor(color(col1), color(col2), lerpAmt);

    let x = spacing * index;
    let bendFactor = sin(bendSlider.value() * (index / totalLines));
    let yStart = (height - lineHeight) / 2 + bendFactor * 100;
    let yEnd = yStart + lineHeight;

    stroke(col);
    strokeWeight(lineThickness);
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
