import { distance, distance_squared } from '../math/vector2';
import { Point2D } from '../types';

export class Line {
  start: Point2D;
  end: Point2D;

  constructor(start: Point2D, end: Point2D) {
    this.start = start;
    this.end = end;
  }

  public lengthen(n: number): Line {
    let dx = this.end[0] - this.start[0];
    let dy = this.end[1] - this.start[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      dx /= length;
      dy /= length;
    }
    dx *= length + n;
    dy *= length + n;
    this.start[0] = this.start[0] + dx;
    this.start[1] = this.start[1] + dy;
    return this;
  }

  public get midpoint(): Point2D {
    return [
      (this.start[0] + this.end[0]) / 2,
      (this.start[1] + this.end[1]) / 2,
    ];
  }

  public get length(): number {
    return distance(this.start, this.end);
  }

  public get length_squared(): number {
    return distance_squared(this.start, this.end);
  }
}
