import { Character } from '../../game/character';
import { Scene } from '../../game/scene';
import { rgbaString, rgbString } from '../../math/color';
import { TAU } from '../../math/util';
import { Vector2 } from '../../math/vector2';
import settings from '../../settings';
import { RgbaColor } from '../../types';
import { Canvas } from '../canvas';
import { Renderer } from '../renderer';

export class CanvasRenderer implements Renderer {
  public canvas: Canvas;
  public ctx: CanvasRenderingContext2D;
  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.ctx = canvas.canvas.getContext('2d')!;
  }

  private _clear(color: RgbaColor) {
    this.ctx.save();
    this.ctx.fillStyle = rgbaString(color);
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  }

  private _renderCharacter(c: Character) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = rgbString(c.color);
    ctx.fillRect(c.pos[0], c.pos[1], c.size[0], c.size[1]);
    ctx.restore();
  }

  render(scene: Scene, pointerPosition?: Vector2): void {
    this._clear(
      settings.rendererSettings.clearColor.map((c) => c * 255) as RgbaColor,
    );

    const ctx = this.ctx;
    if (pointerPosition) {
      ctx.save();
      ctx.fillStyle = rgbaString([255, 0, 0, 0.5]);
      ctx.beginPath();
      ctx.arc(pointerPosition[0], pointerPosition[1], 32, 0, TAU, false);
      ctx.fill();
      ctx.restore();
    }

    this._renderCharacter(scene.a);
    this._renderCharacter(scene.b);

    for (const e of scene.e) {
      this._renderCharacter(e);
    }
  }
}
