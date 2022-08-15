import { create, from_rotation, transform_point } from '../math/matrix2d';
import { nearlyEqual } from '../math/util';
import { subtract, scale, add } from '../math/vector2';
import { Point2D } from '../types';
import { Circle } from './circle';
import { Line } from './line';
import { OrientedRectangle } from './oriented-rectangle';
import { Rectangle } from './rectangle';

export function pointOnLine(point: Point2D, line: Line): boolean {
  const [dx, dy] = subtract([0, 0], line.end, line.start);
  const M = dx / dy;
  const B = line.start[1] - M * line.start[0];
  return nearlyEqual(point[1], M * point[0] + B);
}

export function pointInCircle(point: Point2D, c: Circle): boolean {
  const line = new Line(point, c.position);
  return line.length_squared < c.radius * c.radius;
}

export function pointInRectangle(
  [px, py]: Point2D,
  rectangle: Rectangle,
): boolean {
  const [minX, minY] = rectangle.min;
  const [maxX, maxY] = rectangle.max;
  return minX <= px && minY <= py && px <= maxX && py <= maxY;
}

export function pointInOrientedRectangle(
  point: Point2D,
  rectangle: OrientedRectangle,
): boolean {
  const r = subtract([0, 0], point, rectangle.position);
  return pointInRectangle(
    add(
      [0, 0],
      transform_point(r, r, from_rotation(create(), -rectangle.orientation)),
      rectangle.halfExtends,
    ),
    new Rectangle([0, 0], scale([0, 0], rectangle.halfExtends, 2)),
  );
}
