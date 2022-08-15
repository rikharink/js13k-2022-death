import { Vector2 } from '../math/vector2';
import { Point2D, Radian } from '../types';

export class OrientedRectangle {
  public position: Point2D;
  public halfExtends: Vector2;
  public orientation: Radian;

  constructor(position?: Point2D, halfExtends?: Vector2, orientation?: Radian) {
    this.position = position ?? [0, 0];
    this.halfExtends = halfExtends ?? [1, 1];
    this.orientation = orientation ?? 0;
  }
}
