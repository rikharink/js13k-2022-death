import { Character } from '../../game/character';
import { Scene } from '../../game/scene';
import {
  darken,
  mixRyb,
  rgbaString,
  rgbString,
  rgbToRyb,
  rybToRgb,
} from '../../math/color';
import { TAU } from '../../math/util';
import { Vector2 } from '../../math/vector2';
import { add, scale, Vector3 } from '../../math/vector3';
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
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(
      0,
      0,
      this.canvas.canvas.width,
      this.canvas.canvas.height,
    );
    this.ctx.fillStyle = '#000000';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = 'normal bold 4rem sans-serif';
    const hw = canvas.canvas.width * 0.5;
    const hh = canvas.canvas.height * 0.5;
    this.ctx.fillText('CLICK TO START', hw, hh);
  }

  private _clear(color: RgbaColor) {
    this.ctx.save();
    this.ctx.fillStyle = rgbaString(color);
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  }

  private _renderCharacter(c: Character) {
    const ctx = this.ctx;
    const strokeWidth = 4;
    ctx.save();
    ctx.fillStyle = rgbString(c.color);
    ctx.strokeStyle = rgbString(darken(c.color, 50));
    ctx.lineWidth = strokeWidth;
    ctx.fillRect(c.pos[0], c.pos[1], c.size[0], c.size[1]);
    if (c.followPointer) {
      ctx.strokeRect(c.pos[0], c.pos[1], c.size[0], c.size[1]);
    }
    ctx.restore();
  }

  render(scene: Scene, pointerPosition?: Vector2): void {
    this._clear(
      settings.rendererSettings.clearColor.map((c) => c * 255) as RgbaColor,
    );

    const ctx = this.ctx;
    if (pointerPosition) {
      const col_a = scene.a.color;
      const col_b = scene.b.color;
      const col_mix: Vector3 = [0, 0, 0];
      add(col_mix, col_a, col_b);
      col_mix[0] = Math.min(255, col_mix[0]);
      col_mix[1] = Math.min(255, col_mix[1]);
      col_mix[2] = Math.min(255, col_mix[2]);

      let col: Vector3 = [0, 0, 0];
      let alpha = 0.5;
      if (scene.a.followPointer && scene.b.followPointer) {
        col = col_mix;
        alpha = 1;
      } else if (scene.a.followPointer) {
        col = col_a;
        alpha = 1;
      } else if (scene.b.followPointer) {
        col = col_b;
        alpha = 1;
      }
      ctx.save();
      ctx.fillStyle = rgbaString([...col, alpha]);
      ctx.beginPath();
      ctx.arc(pointerPosition[0], pointerPosition[1], 16, 0, TAU, false);
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
