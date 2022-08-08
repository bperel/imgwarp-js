import Point from "./point.js";
import {Warper} from "./deformation.js";

class PointDefiner {
  constructor(canvas, image, imgData) {
    this.oriPoints = [];
    this.dstPoints = [];

    //set up points for change;
    const c = canvas;
    this.canvas = canvas;
    const that = this;
    this.dragging_ = false;
    this.computing_ = false;
    $(c).unbind();
    $(c).bind('mousedown', e => {
      that.touchStart(e);
    });
    $(c).bind('mousemove', e => {
      that.touchDrag(e);
    });
    $(c).bind('mouseup', () => {
      that.touchEnd();
    });
    this.currentPointIndex = -1;
    this.imgWarper = new Warper(c, image, imgData);
  }

  touchEnd() {
    this.dragging_ = false;
  }

  touchDrag(e) {
    if (this.computing_ || !this.dragging_ || this.currentPointIndex < 0) {
      return;
    }
    this.computing_ = true;
    e.preventDefault();
    const endX = (e.offsetX || e.clientX - $(e.target).offset().left);
    const endY = (e.offsetY || e.clientY - $(e.target).offset().top);

    new Point(endX, endY);
    this.dstPoints[this.currentPointIndex] = new Point(endX, endY);
    this.redraw();
    this.computing_ = false;
  }

  redraw() {
    if (this.oriPoints.length < 3) {
      if (document.getElementById('show-control').checked) {
        this.redrawCanvas();
      }
      return;
    }
    this.imgWarper.warp(this.oriPoints, this.dstPoints);
    if (document.getElementById('show-control').checked) {
      this.redrawCanvas();
    }
  }

  touchStart(e) {
    this.dragging_ = true;
    e.preventDefault();
    const startX = (e.offsetX || e.clientX - $(e.target).offset().left);
    const startY = (e.offsetY || e.clientY - $(e.target).offset().top);
    const q = new Point(startX, startY);

    if (e.ctrlKey) {
      this.oriPoints.push(q);
      this.dstPoints.push(q);
    } else if (e.shiftKey) {
      const pointIndex = this.getCurrentPointIndex(q);
      if (pointIndex >= 0) {
        this.oriPoints.splice(pointIndex, 1);
        this.dstPoints.splice(pointIndex, 1);
      }
    } else {
      this.currentPointIndex = this.getCurrentPointIndex(q);
    }
    this.redraw();
  }

  getCurrentPointIndex(q) {
    let currentPoint = -1;

    for (let i = 0; i < this.dstPoints.length; i++) {
      if (this.dstPoints[i].InfintyNormDistanceTo(q) <= 20) {
        currentPoint = i;
        return i;
      }
    }
    return currentPoint;
  }

  redrawCanvas() {
    const ctx = this.canvas.getContext("2d");
    for (let i = 0; i < this.oriPoints.length; i++) {
      if (i < this.dstPoints.length) {
        if (i == this.currentPointIndex) {
          this.drawOnePoint(this.dstPoints[i], ctx, 'orange');
        } else {
          this.drawOnePoint(this.dstPoints[i], ctx, '#6373CF');
        }

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(this.oriPoints[i].x, this.oriPoints[i].y);
        ctx.lineTo(this.dstPoints[i].x, this.dstPoints[i].y);
        //ctx.strokeStyle = '#691C50';
        ctx.stroke();
      } else {
        this.drawOnePoint(this.oriPoints[i], ctx, '#119a21');
      }
    }
    ctx.stroke();
  }

  drawOnePoint(point, ctx, color) {
    const radius = 10;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.arc(parseInt(point.x), parseInt(point.y), radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.arc(parseInt(point.x), parseInt(point.y), 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }
}


export default PointDefiner
