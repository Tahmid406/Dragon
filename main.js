class Vehicle {
  constructor() {
    this.position = createVector(width / 2, height / 2);
    this.velocity = createVector(0, 0);
    this.accelaration = createVector(0, 0);
    this.maxSpeed = 5;
    this.maxforce = 0.6;
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
    dir.sub(this.vel).limit(this.maxforce);
    this.accelaration.add(dir);
  }

  render() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + PI / 2);
    triangle(0, -this.r * 2, this.r, this.r, -this.r, this.r);
    pop();
  }
}

let train = [];
const boggies = 50;

function setup() {
  createCanvas(innerWidth, innerHeight);

  vehicle = new Vehicle();
  target = createVector(mouseX, mouseY);
  train.push(vehicle);

  for (let i = 0; i < boggies; i++) train.push(new Vehicle());

  fill(255, 100);
  stroke(255, 100);
}

function draw() {
  background(0);
  // console.log(frameRate());

  target.set(mouseX, mouseY);
  ellipse(target.x, target.y, 20, 20);

  vehicle.steer(target);
  vehicle.update();
  vehicle.render();
  for (let i = 1; i < boggies; i++) {
    train[i].steer(train[i - 1].position);
    train[i].update();
    strokeWeight(1);
    train[i].render();
    strokeWeight(10);
    line(
      train[i].position.x,
      train[i].position.y,
      train[i - 1].position.x,
      train[i - 1].position.y
    );
  }
}
