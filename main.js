class Vehicle {
  constructor() {
    this.position = createVector(width / 2, height / 2);
    this.velocity = createVector(0, 0);
    this.accelaration = createVector(0, 0);
    this.maxSpeed = 5;
    this.maxforce = 0.5;
    this.r = 10;
    this.stopRadius = 50;
  }

  update() {
    this.velocity.add(this.accelaration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.accelaration.set(0, 0);
  }

  steer(target) {
    let dir = p5.Vector.sub(target, this.position);
    dir.setMag(this.maxSpeed);
    dir.sub(this.velocity).limit(this.maxforce);
    this.accelaration.add(dir);
  }

  render(i = 0) {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + PI / 2);

    // Main triangle body
    let sizeFactor = map(i, 0, boggies, 1.4, 1); // taper toward tail
    let r = this.r * sizeFactor;

    // Base body color gradient from head to tail
    let hue = map(i, 0, boggies, 140, 120); // from greenish to reddish
    strokeWeight(2);
    stroke(hue, 80, 60);
    fill(hue, 80, 80);
    triangle(0, -r * 2, r, r, -r, r);

    // Draw horns/spikes for the head
    if (i === 0) r *= 1.2;
    else r *= 0.8;

    // Create more interesting horn shapes
    let hornLength = r * 1.2;

    // Left horn/spike - coming from back of triangle
    push();
    fill(140, 90, 70); // Slightly different color for horns
    beginShape();
    vertex(-r * 0.8, r); // base left (back edge of triangle)
    vertex(-r * 0.4, r); // inner base
    vertex(-r * 1.4, r + hornLength); // tip extending backward
    vertex(-r * 1.6, r + hornLength * 0.8); // outer edge
    endShape(CLOSE);
    pop();

    // Right horn/spike - coming from back of triangle
    push();
    fill(140, 90, 70);
    beginShape();
    vertex(r * 0.8, r); // base right (back edge of triangle)
    vertex(r * 1.6, r + hornLength * 0.8); // outer edge
    vertex(r * 1.4, r + hornLength); // tip extending backward
    vertex(r * 0.4, r); // inner base
    endShape(CLOSE);
    pop();

    // Optional: Add some detail lines on the horns
    stroke(140, 95, 60);
    strokeWeight(1);
    line(-r * 0.6, r, -r * 0.8, r + hornLength * 0.7);
    line(r * 0.6, r, r * 0.8, r + hornLength * 0.7);
    noStroke();

    pop();
  }
}

let train = [];
const boggies = 40;
let idealDistance = [];

function setup() {
  createCanvas(innerWidth, innerHeight);

  // Set HSB color mode for the entire sketch
  colorMode(HSB);

  vehicle = new Vehicle();
  target = createVector(mouseX, mouseY);
  train.push(vehicle);

  for (let i = 0; i < boggies; i++) {
    const followerVehicle = new Vehicle();
    followerVehicle.maxSpeed -= i * 0.02;
    followerVehicle.maxforce -= i * 0.002;
    train.push(followerVehicle);
  }
}

function draw() {
  background(0);

  // Set color mode once at the beginning
  colorMode(HSB);

  // Draw target
  fill(0, 0, 100, 0.4); // white with transparency
  target.set(mouseX, mouseY);
  ellipse(target.x, target.y, 20, 20);

  // Update and render head vehicle
  vehicle.steer(target);
  vehicle.update();
  vehicle.render(0); // head

  // Set stroke properties once for all connecting lines
  strokeWeight(6);
  stroke(130, 80, 56, 0.7);

  for (let i = 1; i < boggies; i++) {
    const leader = train[i - 1];
    const follower = train[i];

    // Normal steering
    follower.steer(leader.position);
    follower.update();

    // 👉 Enforce fixed spacing between leader and follower
    let desiredDistance = 24 + i * (4 / 5); // You can tune this
    let dir = p5.Vector.sub(follower.position, leader.position);
    let d = dir.mag();

    if (d > 0.001) {
      // Avoid division by zero
      let diff = d - desiredDistance;
      dir.normalize();
      dir.mult(diff * 0.5); // 0.5 distributes correction between both (optional)
      follower.position.sub(dir);
      // Optionally: move leader too (if you want elastic body feel)
      leader.position.add(dir);
    }

    // Now render
    follower.render(i);

    // Draw connecting line
    line(
      follower.position.x,
      follower.position.y,
      leader.position.x,
      leader.position.y
    );
  }
}
