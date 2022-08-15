interface CanvasRenderingContext2D {
  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    ...radii: number[]
  );
  circle(x: number, y: number, r: number);
}
