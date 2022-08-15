import { Circle } from './circle';
import { Line } from './line';
import { OrientedRectangle } from './oriented-rectangle';
import { Rectangle } from './rectangle';
import {
  create,
  from_rotation,
  Matrix2D,
  transform_point,
} from '../math/matrix2d';
import { add, distance_squared, scale, subtract } from '../math/vector2';

export function hasCircleCircleCollision(a: Circle, b: Circle): boolean {
  const d2 = distance_squared(a.position, b.position);
  const r = a.radius + b.radius;
  return d2 < r * r;
}

export function hasCircleRectangleCollision(
  circle: Circle,
  rect: Rectangle,
): boolean {
  const [cx, cy] = circle.position;
  const [rx, ry] = rect.position;
  const [rw, rh] = rect.size;
  let testX = cx;
  let testY = cy;
  if (cx < rx) testX = rx;
  else if (cx > rx + rw) testX = rx + rw;
  if (cy < ry) testY = ry;
  else if (cy > ry + rh) testY = ry + rh;
  const l = new Line([cx, cy], [testX, testY]);
  return l.length_squared <= circle.radius * circle.radius;
}

export function hasCircleOrientedRectangleCollision(
  circle: Circle,
  rect: OrientedRectangle,
): boolean {
  const r = subtract([0, 0], circle.position, rect.position);
  const theta = -rect.orientation;
  const rotation: Matrix2D = create();
  from_rotation(rotation, theta);
  transform_point(r, r, rotation);
  const lCircle = new Circle(add([0, 0], r, rect.halfExtends), circle.radius);
  const lRect = new Rectangle([0, 0], scale([0, 0], rect.halfExtends, 2));

  return hasCircleRectangleCollision(lCircle, lRect);
}

export function hasRectangleRectangleCollision(
  rectA: Rectangle,
  rectB: Rectangle,
): boolean {
  return (
    rectA.position[0] + rectA.size[0] >= rectB.position[0] &&
    rectA.position[0] <= rectB.position[0] + rectB.size[0] &&
    rectA.position[1] + rectA.size[1] >= rectB.position[1] &&
    rectA.position[1] <= rectB.position[1] + rectB.size[1]
  );
}
