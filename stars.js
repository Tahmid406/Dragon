let freeStarIds = Array.from({ length: 51 }, (_, i) => i); // IDs 0 to 100
let starMap = {};

class Star {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(0.02, 0.1));

    this.size = random(2, 8);
    this.points = floor(random(6, 9));
    this.innerRadius = this.size / 8;
    this.outerRadius = this.size;

    this.lifespan = random(300, 600); // Extended life
    this.age = 0; // Used to control fade-in
    this.fadeInDuration = 60; // frames to fully appear
    this.fadeOutStart = 300; // after this, begin fading out
  }

  update() {
    this.age++;
    this.position.add(this.velocity);
  }

  render() {
    push();
    translate(this.position.x, this.position.y);
    noStroke();

    // Fade-in and fade-out alpha
    let alpha = 1;
    if (this.age < this.fadeInDuration) {
      alpha = map(this.age, 0, this.fadeInDuration, 0, 1);
    } else if (this.age > this.fadeOutStart) {
      alpha = map(this.age, this.fadeOutStart, this.lifespan, 1, 0);
    }

    alpha = constrain(alpha, 0, 0.25);

    // Platinum/white-ish color in HSB mode
    fill(0, 0, 95, alpha); // near white
    this.drawStar(0, 0, this.innerRadius, this.outerRadius, this.points);

    pop();
  }

  isDead() {
    return this.age >= this.lifespan;
  }

  drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle * 0.5; // Slightly faster than division
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let cosA = cos(a);
      let sinA = sin(a);
      let cosHalf = cos(a + halfAngle);
      let sinHalf = sin(a + halfAngle);

      vertex(x + cosA * radius2, y + sinA * radius2);
      vertex(x + cosHalf * radius1, y + sinHalf * radius1);
    }
    endShape(CLOSE);
  }
}

//Stars Controller
// Stars Controller
function spawnStars() {
  if (freeStarIds.length > 0) {
    const id = freeStarIds.shift(); // Take the first available ID
    starMap[id] = new Star(random(width), random(height));
  }
}
function updateStars() {
  for (let id in starMap) {
    const star = starMap[id];
    star.update();
    star.render();

    // Remove dead stars and recycle ID
    if (star.isDead()) {
      delete starMap[id];
      freeStarIds.push(Number(id)); // Recycle ID
    }
  }
}
