import { Point2D, Radian } from '../types';

export class Circle {
  public position: Point2D;
  public radius: number;

  constructor(position: Point2D, radius: number) {
    this.position = position;
    this.radius = radius;
  }

  public getPoint(angle: Radian): Point2D {
    return [
      this.position[0] + this.radius * Math.cos(angle),
      this.position[1] + this.radius * Math.sin(angle),
    ];
  }
}
