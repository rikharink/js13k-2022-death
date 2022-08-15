import './debug/gui';
import { showDebugGUI } from './debug/gui';
import { Game } from './game/game';
import { TAU } from './math/util';
import { Canvas } from './rendering/canvas';
import { CanvasRenderer } from './rendering/canvas/canvas-renderer';
import settings from './settings';
import state from './state';

const canvas = new Canvas({
  id: 'g',
  resolution: settings.rendererSettings.resolution,
});
const renderer = new CanvasRenderer(canvas);
state.game = new Game(renderer);
renderer.canvas.canvas.onclick = () => {
  renderer.canvas.canvas.onclick = null;
  renderer.canvas.canvas.classList.add('no-cursor');
  state.game!.start();
};

if (process.env.NODE_ENV === 'development') {
  showDebugGUI();
}

// EXTENSION METHODS
CanvasRenderingContext2D.prototype.roundRect = function (
  x: number,
  y: number,
  width: number,
  height: number,
  ...radii: number[]
) {
  let upperLeft, upperRight, lowerLeft, lowerRight: number;
  if (radii.length == 1) {
    upperLeft = upperRight = lowerLeft = lowerRight = radii[0];
  } else if (radii.length == 2) {
    upperLeft = lowerRight = radii[0];
    upperRight = lowerLeft = radii[1];
  } else if (radii.length == 3) {
    upperLeft = radii[0];
    upperRight = lowerLeft = radii[1];
    lowerRight = radii[2];
  } else {
    upperLeft = radii[0];
    upperRight = radii[1];
    lowerRight = radii[2];
    lowerLeft = radii[3];
  }
  this.beginPath();
  this.moveTo(x + upperLeft, y);
  this.lineTo(x + width - upperRight, y);
  this.quadraticCurveTo(x + width, y, x + width, y + upperRight);
  this.lineTo(x + width, y + height - lowerRight);
  this.quadraticCurveTo(
    x + width,
    y + height,
    x + width - lowerRight,
    y + height,
  );
  this.lineTo(x + lowerLeft, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - lowerLeft);
  this.lineTo(x, y + upperLeft);
  this.quadraticCurveTo(x, y, x + upperLeft, y);
  this.closePath();
  return this;
};

CanvasRenderingContext2D.prototype.circle = function (
  x: number,
  y: number,
  r: number,
) {
  this.beginPath();
  this.arc(x, y, r, 0, TAU, false);
  this.closePath();
  return this;
};
