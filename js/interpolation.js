class BilinearInterpolation {
  constructor(width, height, canvas) {
    this.width = width;
    this.height = height;
    this.ctx = canvas.getContext("2d");
    this.imgTargetData = this.ctx.createImageData(this.width, this.height);
  }

  generate(source, fromGrid, toGrid) {
this.imgData = source;
for (let i = 0; i < toGrid.length; ++i) {
  this.fill(toGrid[i], fromGrid[i]);
}
return this.imgTargetData;
}

  fill(sourcePoints, fillingPoints) {
    let i, j;
    let srcX, srcY;
    let x0 = fillingPoints[0].x;
    let x1 = fillingPoints[2].x;
    let y0 = fillingPoints[0].y;
    let y1 = fillingPoints[2].y;
    x0 = Math.max(x0, 0);
y0 = Math.max(y0, 0);
x1 = Math.min(x1, this.width - 1);
y1 = Math.min(y1, this.height - 1);

    let xl, xr, topX, topY, bottomX, bottomY;
    let yl, yr, index;
    for (i = x0; i <= x1; ++i) {
  xl = (i - x0) / (x1 - x0);
  xr = 1 - xl;
  topX = xr * sourcePoints[0].x + xl * sourcePoints[1].x;
  topY = xr * sourcePoints[0].y + xl * sourcePoints[1].y;
  bottomX = xr * sourcePoints[3].x + xl * sourcePoints[2].x;
  bottomY = xr * sourcePoints[3].y + xl * sourcePoints[2].y;
  for (j = y0; j <= y1; ++j) {
    yl = (j - y0) / (y1 - y0);
    yr = 1 - yl;
    srcX = topX * yr + bottomX * yl;
    srcY = topY * yr + bottomY * yl;
    index = ((j * this.width) + i) * 4;
    if (srcX < 0 || srcX > this.width - 1 ||
        srcY < 0 || srcY > this.height - 1) {
      this.imgTargetData.data[index] = 255;
      this.imgTargetData.data[index + 1] = 255;
      this.imgTargetData.data[index + 2] = 255;
      this.imgTargetData.data[index + 3] = 255;
      continue;
    }
    const srcX1 = Math.floor(srcX);
    const srcY1 = Math.floor(srcY);
    const base = ((srcY1 * this.width) + srcX1) * 4;
    //rgb = this.nnquery(srcX, srcY);
    this.imgTargetData.data[index] = this.imgData[base];
    this.imgTargetData.data[index + 1] = this.imgData[base + 1];
    this.imgTargetData.data[index + 2] = this.imgData[base + 2];
    this.imgTargetData.data[index + 3] = this.imgData[base + 3];
  }
}
}

  nnquery(x, y) {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const base = ((y1 * this.width) + x1) * 4;
    return [
      this.imgData[base],
      this.imgData[base + 1],
      this.imgData[base + 2],
      this.imgData[base + 3]];
  }

  query(x, y) {
    let x1, x2, y1, y2;
    x1 = Math.floor(x); x2 = Math.ceil(x);
    y1 = Math.floor(y); y2 = Math.ceil(y);

    const c = [0, 0, 0, 0];   // get new RGB

    const base11 = ((y1 * this.width) + x1) * 4;
    const base12 = ((y2 * this.width) + x1) * 4;
    const base21 = ((y1 * this.width) + x2) * 4;
    const base22 = ((y2 * this.width) + x2) * 4;
    // 4 channels: RGBA
    for (let i = 0; i < 4; ++i) {
      const t11 = this.imgData[base11 + i];
      const t12 = this.imgData[base12 + i];
      const t21 = this.imgData[base21 + i];
      const t22 = this.imgData[base22 + i];
      const t = (t11 * (x2 - x) * (y2 - y) +
          t21 * (x - x1) * (y2 - y) +
          t12 * (x2 - x) * (y - y1) +
          t22 * (x - x1) * (y - y1)) / ((x2 - x1) * (y2 - y1));
      c[i] = parseInt(t);
    }
    return c;
  }
}

export default BilinearInterpolation
