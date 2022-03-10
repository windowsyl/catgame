let r = 20;
let s; //r * sqrt(3)/2
class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.darkened = false;

    this.animationTimer = 0;
    this.animationLength = 1;
    this.initialLoc = { x: 0, y: 0 };
    this.isFalling = false;
  }
  shockwave() {
    tiles.forEach((t) => {
      let rockDist = dist(t.x, t.y, this.x, this.y);
      if (rockDist < 60 && rockDist > 0) {
        t.animationTimer = 0.15;
        t.animationLength = 0.15;
        let xoffset = t.x + 0.3 * (t.x - this.x);
        let yoffset = t.y + 0.3 * (t.y - this.y);
        t.initialLoc = { x: xoffset, y: yoffset };

        if (t == cat.location) {
          catHit.play();
        }
      }
    });
  }
  draw() {
    if (this.animationTimer <= 0) {
      this.basicDraw(this.x, this.y);
      if (this.isFalling) {
        this.isFalling = false;
        this.shockwave();
      }
    } else {
      if (this.isFalling) {
        this.darkened = false;
        this.basicDraw(this.x, this.y);
        this.darkened = true;
      }
      this.basicDraw(
        lerp(
          this.initialLoc.x,
          this.x,
          1 - this.animationTimer / this.animationLength
        ),
        lerp(
          this.initialLoc.y,
          this.y,
          1 - this.animationTimer / this.animationLength
        )
      );
      this.animationTimer -= deltaTime / 1000;
    }
  }
  basicDraw(x, y) {
    if (this.darkened) fill(70);
    else fill(0, 70, 0);
    noStroke();
    hexagon(x, y);
  }
  startFalling() {
    this.isFalling = true;
    this.darkened = true;
    this.initialLoc = { x: this.x, y: this.y - 60 };
    this.animationTimer = 0.1;
    this.animationLength = 0.1;
  }
}

class Cat {
  constructor(tile) {
    this.location = tile;
  }
  draw() {
    fill(0);
    let drawx = lerp(
      this.location.initialLoc.x,
      this.location.x,
      1 - this.location.animationTimer / this.location.animationLength
    );
    let drawy = lerp(
      this.location.initialLoc.y,
      this.location.y,
      1 - this.location.animationTimer / this.location.animationLength
    );
    this.stamp(drawx, drawy);
  }
  ear(x, y) {
    fill('tan');
    noStroke();
    triangle(x - 8, y - 5, x - 4, y - 14, x - 1, y - 5);
    strokeWeight(2);
    stroke(0);
    curve(x - 8, y - 5, x - 4, y - 14, x - 1, y - 5, x - 8, y - 5);
    curve(x - 1, y - 5, x - 8, y - 5, x - 4, y - 14, x - 1, y - 5);
  }
  stamp(x, y) {
    x -= 3;
    y += 1;
    fill(0);
    stroke(0);
    circle(x, y, 20);
    this.ear(x, y-1);
    this.ear(x+8,y-1)
    noFill();
    strokeWeight(3);
    bezier(x + 18, y - 4, x + 7, y - 6, x + 19, y + 8, x + 5, y + 7);
  }
  get x() {
    return this.location.x;
  }
  get y() {
    return this.location.y;
  }
}

function makeTiles() {
  let tiles = [];
  let spacing = 3;
  for (let y = 25 + 2 * s; y < height - 25 - s; y += 2 * s + spacing * 2) {
    for (let x = 25 + r; x < width - 25 - r; x += 3 * r + spacing * 2) {
      tiles.push(new Tile(x, y));
      tiles.push(new Tile(x + 1.5 * r + spacing, y + s + spacing));
    }
  }
  return tiles;
}

function mouseClicked() {
  if (mouseY > 45 && mouseY < 466 && mouseX > 25 && mouseX < 760) {
    let nearest = null;
    let minDist = Infinity;
    for (let tile of tiles) {
      if (dist(tile.x, tile.y, mouseX, mouseY) < minDist) {
        minDist = dist(tile.x, tile.y, mouseX, mouseY);
        nearest = tile;
        if (minDist < s) break;
      }
    }
    if (activePlayer == 0) {
      if (!nearest.darkened && cat.location != nearest) {
        nearest.startFalling();
        rockPlaced.play();
        activePlayer = 1;
        catNeighbors = [];
        tiles.forEach((t) => {
          let catDist = dist(t.x, t.y, cat.x, cat.y);
          if (catDist < 60 && catDist > 0) {
            catNeighbors.push(t);
          }
        });

        if (catNeighbors.every((t) => t.darkened)) {
          console.log('rocks win');
          rocksWin.play();
          activePlayer = 3;
        }
      }
    } else if (activePlayer == 1) {
      if (
        dist(nearest.x, nearest.y, cat.x, cat.y) < r + r + 3 &&
        !nearest.darkened &&
        nearest != cat.location
      ) {
        cat.location = nearest;
        if (cat.x < 46 || cat.x > 737 || cat.y < 80 || cat.y > 425) {
          console.log('cat wins');
          catWins.play();
          activePlayer = 2;
        } else {
          catMoved.play();
          activePlayer = 0;
        }
      }
    }
  }
}

function hexagon(x, y) {
  beginShape();
  for (let a = 0; a < TWO_PI; a += PI / 3) {
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

let tiles;
let cat;
let activePlayer = 0;
let rockPlaced;
let catMoved;
let catHit;
let catWins;
let rocksWin;
function setup() {
  createCanvas(800, 500, P2D);
  s = (sqrt(3) / 2) * r;
  rockPlaced = loadSound('rockPlaced.m4a');
  catHit = loadSound('catHit.m4a');
  catMoved = loadSound('catMoved.m4a');
  catWins = loadSound('catWins.m4a');
  rocksWin = loadSound('rocksWin.m4a');

  tiles = makeTiles();
  cat = new Cat(tiles[120]);
  // tiles.sort(() => 0.5 - random());
  // tiles
  //   .slice(0, floor(tiles.length * 0.2))
  //   .forEach((tile) => (tile.darkened = true));
}

function draw() {
  background(200);
  tiles.forEach((t) => {
    t.draw();
  });
  cat.draw();
  if (activePlayer == 2) {
    textSize(120);
    fill(212, 175, 55);
    text('cat wins!!', 150, 300);
  } else if (activePlayer == 3) {
    textSize(120);
    fill(212, 175, 55);
    text('rocks win!!', 150, 300);
  }
}
