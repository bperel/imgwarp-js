import Point from "./point.js";
import Matrix22 from "./matrix22.js";
import BilinearInterpolation from "./interpolation.js";

class Warper {
  constructor(
      canvas, img, imgData, optGridSize, optAlpha) {
    this.alpha = optAlpha || 1;
    this.gridSize = optGridSize || 20;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    const source = img;
    this.width = source.width;
    this.height = source.height;
    this.imgData = imgData.data;
    canvas.width = source.width;
    canvas.height = source.height;
    this.bilinearInterpolation =
      new BilinearInterpolation(this.width, this.height, canvas);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(imgData, 0, 0);
    console.log('drawn');

    this.grid = [];
    let a;
    let b;
    let c;
    let d;
    for (let i = 0; i < this.width; i += this.gridSize) {
      for (let j = 0; j < this.height; j += this.gridSize) {
        a = new Point(i, j);
        b = new Point(i + this.gridSize, j);
        c = new Point(i + this.gridSize, j + this.gridSize);
        d = new Point(i, j + this.gridSize);
        this.grid.push([a, b, c, d]);
      }
    }
  }

  warp(fromPoints, toPoints) {
    const t0 = (new Date()).getTime();
    const deformation =
      new AffineDeformation(toPoints, fromPoints, this.alpha);
    const transformedGrid = [];
    for (let i = 0; i < this.grid.length; ++i) {
      transformedGrid[i] = [
          deformation.pointMover(this.grid[i][0]),
          deformation.pointMover(this.grid[i][1]),
          deformation.pointMover(this.grid[i][2]),
          deformation.pointMover(this.grid[i][3])];
    }
    const t1 = (new Date()).getTime();
    const newImg = this.bilinearInterpolation
      .generate(this.imgData, this.grid, transformedGrid);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(newImg, 0, 0);
    const t2 = (new Date()).getTime();
    document.getElementById('fps').innerHTML =
      'Deform: ' + (t1 - t0) + 'ms; interpolation: ' + (t2 - t1) + 'ms';
    if (document.getElementById('show-grid').checked) {
      this.drawGrid(fromPoints, toPoints);
    }
  }

  drawGrid(fromPoints, toPoints) {
    // Forward warping.
    const deformation =
      new AffineDeformation(fromPoints, toPoints, this.alpha);
    const context = this.canvas.getContext("2d");
    for (let i = 0; i < this.grid.length; ++i) {
      context.beginPath();
      let point = deformation.pointMover(this.grid[i][0]);
      context.moveTo(point.x, point.y);
      for (let j = 1; j < 4; ++j) {
        point = deformation.pointMover(this.grid[i][j]);
        context.lineTo(point.x, point.y);
      }
      context.strokeStyle = 'rgba(170, 170, 170, 0.5)';
      context.stroke();
    }
  }
}

class AffineDeformation {
  constructor(fromPoints, toPoints, alpha) {
    this.w = null;
    this.pRelative = null;
    this.qRelative = null;
    this.A = null;
    if (fromPoints.length !== toPoints.length) {
      console.error('Points are not of same length.');
      return;
    }
    this.n = fromPoints.length;
    this.fromPoints = fromPoints;
    this.toPoints = toPoints;
    this.alpha = alpha;
  };

  pointMover(point) {
    if (null == this.pRelative || this.pRelative.length < this.n) {
      this.pRelative = new Array(this.n);
    }
    if (null == this.qRelative || this.qRelative.length < this.n) {
      this.qRelative = new Array(this.n);
    }
    if (null == this.w || this.w.length < this.n) {
      this.w = new Array(this.n);
    }
    if (null == this.A || this.A.length < this.n) {
      this.A = new Array(this.n);
    }

    let i
    for (i = 0; i < this.n; ++i) {
      const t = this.fromPoints[i].subtract(point);
      this.w[i] = Math.pow(t.x * t.x + t.y * t.y, -this.alpha);
    }

    const pAverage = Point.weightedAverage(this.fromPoints, this.w);
    const qAverage = Point.weightedAverage(this.toPoints, this.w);

    for (i = 0; i < this.n; ++i) {
      this.pRelative[i] = this.fromPoints[i].subtract(pAverage);
      this.qRelative[i] = this.toPoints[i].subtract(qAverage);
    }

    let B = new Matrix22(0, 0, 0, 0);

    for (i = 0; i < this.n; ++i) {
      B.addM(this.pRelative[i].wXtX(this.w[i]));
    }

    B = B.inverse();
    let j
    for (j = 0; j < this.n; ++j) {
      this.A[j] = point.subtract(pAverage).multiply(B)
        .dotP(this.pRelative[j]) * this.w[j];
    }

    let r = qAverage; //r is an point
    for (j = 0; j < this.n; ++j) {
      r = r.add(this.qRelative[j].multiply_d(this.A[j]));
    }
    return r;
  }
}

export {AffineDeformation, Warper}
