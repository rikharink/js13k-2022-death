import { Character, Status } from '../../game/character';
import { Scene } from '../../game/scene';
import {
  darken,
  mixRyb,
  rgbaString,
  rgbString,
  rgbToRgbaString,
  rgbToRyb,
  rybToRgb,
} from '../../math/color';
import { Vector2 } from '../../math/vector2';
import { Vector3 } from '../../math/vector3';
import settings from '../../settings';
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

  private _clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private _renderCharacter(c: Character) {
    const ctx = this.ctx;
    const strokeWidth = 4;
    const alpha = c.isAlive() ? 1 : 0.5;
    ctx.fillStyle = rgbToRgbaString(c.color, alpha);
    ctx.strokeStyle = c.followPointer
      ? rgbString(darken(c.color, 65))
      : rgbString(darken(c.color, 25));
    ctx.lineWidth = strokeWidth;
    if (c.status === Status.Alive) {
      ctx.roundRect(c.pos[0], c.pos[1], c.size[0], c.size[1], 4);
    } else if (c.status === Status.Dead) {
      ctx.roundRect(c.pos[0], c.pos[1], c.size[0], c.size[1], 25, 25, 4, 4);
    }

    ctx.fill();
    ctx.stroke();
  }

  private _renderHud(scene: Scene) {
    //TODO
  }

  render(scene: Scene, pointerPosition?: Vector2): void {
    const clearColor = settings.rendererSettings.clearColor;

    this.canvas.canvas.style.backgroundColor = rgbaString([
      clearColor[0] * 255,
      clearColor[1] * 255,
      clearColor[2] * 255,
      clearColor[3],
    ]);
    this._clear();

    const ctx = this.ctx;
    if (pointerPosition) {
      const col_a = scene.a.color;
      const col_b = scene.b.color;
      const col_mix = rybToRgb(mixRyb(rgbToRyb(col_a), rgbToRyb(col_b)));

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
      ctx.fillStyle = rgbaString([...col, alpha]);
      ctx.strokeStyle = '#000000';
      ctx.circle(pointerPosition[0], pointerPosition[1], 16);
      ctx.fill();
      ctx.stroke();
    }

    if (scene.a_body) {
      this._renderCharacter(scene.a_body);
    }
    if (scene.b_body) {
      this._renderCharacter(scene.b_body);
    }
    this._renderCharacter(scene.a);
    this._renderCharacter(scene.b);

    for (const e of scene.e) {
      this._renderCharacter(e);
    }

    this._renderHud(scene);
  }
}
