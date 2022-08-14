import './debug/gui';
import { showDebugGUI } from './debug/gui';
import { Game } from './game/game';
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
