import Matrix22 from "./matrix22.js";

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(o) {
    return new Point(this.x + o.x, this.y + o.y);
  }

  subtract(o) {
    return new Point(this.x - o.x, this.y - o.y);
  }

// w * [x; y] * [x, y]
  wXtX(w) {
    return (new Matrix22(
          this.x * this.x * w, this.x * this.y * w,
          this.y * this.x * w, this.y * this.y * w
          ));
  }

// Dot product
  dotP(o) {
    return this.x * o.x + this.y * o.y;
  }

  multiply(o) {
    return new Point(
        this.x * o.M11 + this.y * o.M21, this.x * o.M12 + this.y * o.M22);
  }

  multiply_d(o) {
    return new Point(this.x * o, this.y * o);
  }

  InfintyNormDistanceTo(o) {
    return Math.max(Math.abs(this.x - o.x), Math.abs(this.y - o.y));
  }

  static weightedAverage(p, w) {
    let i;
    let sx = 0,
      sy = 0,
      sw = 0;

    for (i = 0; i < p.length; i++) {
      sx += p[i].x * w[i];
      sy += p[i].y * w[i];
      sw += w[i];
    }
    return new Point(sx / sw, sy / sw);
  }
}

export default Point
