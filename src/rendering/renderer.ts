import { Scene } from '../game/scene';
import { Vector2 } from '../math/vector2';
import { Canvas } from './canvas';

export interface Renderer {
  canvas: Canvas;
  render(scene: Scene, pointerPosition?: Vector2): void;
}
