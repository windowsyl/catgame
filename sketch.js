let r = 20;
let s; //r * sqrt(3)/2
class Tile {
  constructor(x, y, num, neighbors = []) {
    this.x = x;
    this.y = y;
    this.darkened = false;
    this.num = num;
    this.neighbors = neighbors;
  }
  draw() {
    if (this.darkened) fill(70);
    else fill(0, 70, 0);
    noStroke();
    hexagon(this);
    textSize(10);
    fill(0, 0, 0);
    text(this.num, this.x, this.y);
  }
}

class Cat {
  constructor(tile) {
    this.location = tile;
  }
  draw() {
    fill(0);
    circle(this.location.x, this.location.y, 20);
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
      tiles.push(new Tile(x, y, tiles.length));
      tiles.push(
        new Tile(x + 1.5 * r + spacing, y + s + spacing, tiles.length)
      );
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
    // console.log(nearest.x, nearest.y)
    if (activePlayer == 0) {
      if (!nearest.darkened && cat.location != nearest) {
        nearest.darkened = true;
        rockPlaced.play();
        screenShakePhase++;
        activePlayer = 1;
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

let screenShakePhase = -1;
function screenShake() {
  let cx = width / 2;
  let cy = height / 2;
  let factor = 1.1
  translate(cx * (factor-1), cy * (factor-1));
  scale(factor);
  // translate(30*sin(5*screenShakePhase-PI)/(screenShakePhase-PI/5), 0)
  // screenShakePhase++;
  // if(screenShakePhase > 8/5*PI) screenShakePhase = -1
}

function hexagon(tile) {
  beginShape();
  for (let a = 0; a < TWO_PI; a += PI / 3) {
    vertex(tile.x + cos(a) * r, tile.y + sin(a) * r);
  }
  endShape(CLOSE);
}

let tiles;
let cat;
let activePlayer = 0;
let rockPlaced;
let catMoved;
let catWins;
function setup() {
  createCanvas(800, 500, P2D);
  s = (sqrt(3) / 2) * r;
  rockPlaced = loadSound('rockPlaced.m4a');
  catMoved = loadSound('catMoved.m4a');
  catWins = loadSound('catWins.m4a');

  tiles = makeTiles();
  cat = new Cat(tiles[120]);
  // tiles.sort(() => 0.5 - random());
  // tiles
  //   .slice(0, floor(tiles.length * 0.2))
  //   .forEach((tile) => (tile.darkened = true));
}

function draw() {
  background(200);
  // if(screenShakePhase > -1) screenShake();
  screenShake();
  tiles.forEach((t) => { t.draw();
  });
  cat.draw();
  if (activePlayer == 2) {
    textSize(120);
    fill(212, 175, 55);
    text('cat wins!!', 150, 300);
  }
}
