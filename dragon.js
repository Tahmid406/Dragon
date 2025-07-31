class Vehicle {
  constructor(i = 0, boggies) {
    this.position = createVector(width / 2, height / 2);
    this.velocity = createVector(0, 0);
    this.accelaration = createVector(0, 0);
    this.maxSpeed = 5;
    this.maxforce = 0.5;
    this.r = 10;
    this.stopRadius = 50;

    // Precompute hue based on index
    this.t = i / boggies;
    this.hue = map(i, 0, boggies, 230, 200);

    // Pre-calculate rendering properties to avoid repeated calculations
    this.sizeFactor = map(i, 0, boggies, 1.4, 1);
    this.scaledR = this.r * this.sizeFactor;
    this.isHead = i === 0;
    this.glowSize = this.r * map(this.t, 0, 1, 3.6, 2);

    // Pre-calculate horn colors
    this.hornHue = this.hue - 10;
    this.hornStrokeHue = this.hue - 20;

    // Cache frequently used values
    this.halfPI = PI / 2;
    this.hornLength = this.scaledR * 1.2;
  }

  update() {
    this.velocity.add(this.accelaration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.accelaration.set(0, 0);
  }

  steer(target) {
    let dir = p5.Vector.sub(target, this.position);
    let distance = dir.mag();

    // Skip steering if target is very close (micro-optimization)
    if (distance < 0.1) return;

    dir.setMag(this.maxSpeed);
    dir.sub(this.velocity).limit(this.maxforce);
    this.accelaration.add(dir);
  }

  render(i = 0) {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + this.halfPI);

    // Use pre-calculated values
    let r = this.scaledR;

    // Main triangle body - batch drawing operations
    strokeWeight(2);
    stroke(this.hue, 80, 60);
    fill(this.hue, 80, 80);
    triangle(0, -r * 2, r, r, -r, r);

    // Draw horns/spikes for the head
    if (this.isHead) {
      r *= 1.1;
    } else {
      r *= 0.9;
      // 🔆 Subtle glow ring - use pre-calculated size
      noStroke();
      fill(this.hue, 80, 100, 0.15);
      ellipse(0, 0, this.glowSize);
    }

    // Use pre-calculated horn length
    let hornLength = this.hornLength;

    // Batch horn drawing to reduce state changes
    fill(this.hornHue, 90, 70);

    // Left horn/spike
    quad(
      -r * 0.8,
      r,
      -r * 0.4,
      r,
      -r * 1.4,
      r + hornLength,
      -r * 1.6,
      r + hornLength * 0.8
    );

    // Right horn/spike
    quad(
      r * 0.8,
      r,
      r * 1.6,
      r + hornLength * 0.8,
      r * 1.4,
      r + hornLength,
      r * 0.4,
      r
    );

    // Horn detail lines - batch stroke operations
    stroke(this.hornStrokeHue, 95, 60);
    strokeWeight(1);
    line(-r * 0.6, r, -r * 0.8, r + hornLength * 0.7);
    line(r * 0.6, r, r * 0.8, r + hornLength * 0.7);

    pop();
  }
}

function spawnDragon(boggies) {
  let dragon = [];
  const head = new Vehicle(0, boggies);
  dragon.push(head);

  for (let i = 0; i < boggies; i++) {
    const followerVehicle = new Vehicle(i, boggies);
    followerVehicle.maxSpeed -= i * 0.02;
    followerVehicle.maxforce -= i * 0.002;
    dragon.push(followerVehicle);
  }

  return dragon;
}

function updateDragon(dragon, target) {
  // Head steers toward the target
  dragon[0].steer(target);
  dragon[0].update();

  // Followers steer toward the previous one
  for (let i = 1; i < dragon.length; i++) {
    const leader = dragon[i - 1];
    const follower = dragon[i];

    follower.steer(leader.position);
    follower.update();

    // Enforce fixed spacing between leader and follower
    let desiredDistance = 24 + i * 0.8; // Pre-calculate 4/5 = 0.8
    let dir = p5.Vector.sub(follower.position, leader.position);
    let d = dir.magSq(); // Use magSq() to avoid expensive sqrt
    let desiredDistanceSq = desiredDistance * desiredDistance;

    if (d > desiredDistanceSq * 0.000001) {
      // Compare squared distances
      let actualDistance = Math.sqrt(d); // Only calculate sqrt when needed
      let diff = actualDistance - desiredDistance;
      dir.div(actualDistance); // Normalize by dividing by magnitude
      dir.mult(diff * 0.5);
      follower.position.sub(dir);
      leader.position.add(dir);
    }
  }
}

function drawDragon(dragon) {
  // Pre-calculate connection line properties to reduce repeated calculations
  const dragonLength = dragon.length;

  // Then draw all vehicles
  for (let i = 0; i < dragonLength; i++) {
    dragon[i].render(i);
  }

  // Draw all connection lines first to batch similar operations
  for (let i = 1; i < dragonLength; i++) {
    const vehicle = dragon[i];
    const prevVehicle = dragon[i - 1];

    strokeWeight(map(i, 1, dragonLength, 10, 5));
    stroke(vehicle.hue, 80, 56, 0.7);
    line(
      vehicle.position.x,
      vehicle.position.y,
      prevVehicle.position.x,
      prevVehicle.position.y
    );
  }
}
