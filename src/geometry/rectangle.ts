import { add, subtract, Vector2 } from '../math/vector2';
import { Point2D } from '../types';

export class Rectangle {
  public position: Point2D;
  public size: Vector2;

  constructor(origin: Point2D, size: Vector2) {
    this.position = origin;
    this.size = size;
  }

  public static fromMinMax(min: Point2D, max: Point2D): Rectangle {
    return new Rectangle(min, subtract([0, 0], max, min));
  }

  public get min(): Point2D {
    const p1 = this.position;
    const p2 = add([0, 0], this.position, this.size);
    return [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1])];
  }

  public get max(): Point2D {
    const p1 = this.position;
    const p2 = add([0, 0], this.position, this.size);
    return [Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])];
  }
}
