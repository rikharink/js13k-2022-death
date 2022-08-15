import { Rectangle } from './rectangle';
import { Point2D } from './../types';
import { Circle } from './circle';
import { Line } from './line';
import { pointInRectangle, pointOnLine } from './point-containment';
import { OrientedRectangle } from './oriented-rectangle';
import { add, dot, mul, normalize, scale, subtract } from '../math/vector2';
import { create, from_rotation, transform_point } from '../math/matrix2d';

export function pointLineIntersection(point: Point2D, line: Line): boolean {
  return pointOnLine(point, line);
}

export function linePointIntersection(line: Line, point: Point2D): boolean {
  return pointOnLine(point, line);
}

export function circleLineIntersection(circle: Circle, line: Line): boolean {
  return lineCircleIntersection(line, circle);
}

export function rectangleLineIntersection(
  rectangle: Rectangle,
  line: Line,
): boolean {
  return lineRectangleIntersection(line, rectangle);
}

export function orientedRectangleLineIntersection(
  rectangle: OrientedRectangle,
  line: Line,
): boolean {
  return lineOrientedRectangleIntersection(line, rectangle);
}

export function lineCircleIntersection(line: Line, circle: Circle): boolean {
  const ab = subtract([0, 0], line.end, line.start);
  const t =
    dot(subtract([0, 0], circle.position, line.start), ab) / dot(ab, ab);
  if (t < 0.0 || t > 1.0) {
    return false;
  }
  const circleToClosest = new Line(
    circle.position,
    add([0, 0], line.start, scale([0, 0], ab, t)),
  );
  return circleToClosest.length_squared < circle.radius * circle.radius;
}

export function lineRectangleIntersection(l: Line, r: Rectangle): boolean {
  if (pointInRectangle(l.start, r) || pointInRectangle(l.end, r)) {
    return true;
  }
  const norm = normalize([0, 0], subtract([0, 0], l.end, l.start));
  norm[0] = norm[0] !== 0 ? 1 / norm[0] : 0;
  norm[1] = norm[1] !== 0 ? 1 / norm[1] : 0;
  const min = mul([0, 0], subtract([0, 0], r.min, l.start), norm);
  const max = mul([0, 0], subtract([0, 0], r.max, l.start), norm);
  const tmin = Math.max(Math.min(min[0], max[0]), Math.min(min[1], max[1]));
  const tmax = Math.min(Math.max(min[0], max[0]), Math.max(min[1], max[1]));
  if (tmax < 0 || tmin > tmax) {
    return false;
  }
  const t = tmin < 0 ? tmax : tmin;
  return t > 0 && t * t < l.length_squared;
}

export function lineOrientedRectangleIntersection(
  line: Line,
  rect: OrientedRectangle,
): boolean {
  const r = subtract([0, 0], line.end, rect.position);
  return lineRectangleIntersection(
    new Line(
      add(
        [0, 0],
        transform_point([0, 0], r, from_rotation(create(), -rect.orientation)),
        rect.halfExtends,
      ),
      add([0, 0], r, rect.halfExtends),
    ),
    new Rectangle([0, 0], scale([0, 0], rect.halfExtends, 2)),
  );
}
