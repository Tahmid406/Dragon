let frameCount = 0;
const boggies = 40;

let dragon = [];
let target;

function setup() {
  createCanvas(innerWidth, innerHeight);
  colorMode(HSB); // Set HSB color mode

  // Initial target vectors
  target = createVector(mouseX, mouseY);

  // Spawn two dragons
  dragon = spawnDragon(boggies);
}

function draw() {
  background(0, 0, 0, 0.5);

  // Batch star operations
  spawnStars();
  updateStars();

  // Set color mode once (already set in setup, but ensure consistency)
  colorMode(HSB);

  // 🐉 Dragon 1 - follows mouse
  target.set(mouseX, mouseY);

  // Batch target rendering with dragon rendering
  updateDragon(dragon, target);
  drawDragon(dragon);

  // Draw target indicator after dragon to ensure it's visible
  fill(0, 0, 100, 0.4);
  noStroke();
  ellipse(target.x, target.y, 20, 20);
}
