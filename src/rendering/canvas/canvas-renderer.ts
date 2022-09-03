import { Character, CharacterType, Status } from '../../game/character';
import { Scene } from '../../game/scene';
import {
  darken,
  lighten,
  mixRyb,
  rgbaString,
  rgbString,
  rgbToRgbaString,
  rgbToRyb,
  rybToRgb,
} from '../../math/color';
import { add, normalize, scale, subtract, Vector2 } from '../../math/vector2';
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

  private _renderCharacter(c: Character, pointerPosition?: Vector2) {
    const ctx = this.ctx;
    const strokeWidth = 4;
    const alpha = c.isAlive() ? 1 : 0.5;
    ctx.fillStyle = rgbToRgbaString(c.color, alpha);
    ctx.strokeStyle = c.followPointer
      ? rgbString(darken(c.color, 65))
      : rgbString(darken(c.color, 25));
    ctx.lineWidth = strokeWidth;
    const corner = 4;
    if (c.status === Status.Alive) {
      ctx.roundRect(
        c.pos[0],
        c.pos[1],
        c.size[0],
        c.size[1],
        corner,
        corner,
        4,
        4,
      );
    } else if (c.status === Status.Dead) {
      ctx.roundRect(c.pos[0], c.pos[1], c.size[0], c.size[1], 25, 25, 4, 4);
    }
    ctx.fill();
    ctx.stroke();

    if (c.type == CharacterType.Player && c.isDead()) {
      this._drawGhostFace(ctx, c, pointerPosition);
    } else if (c.type == CharacterType.PlayerBody) {
      this._drawPlayerBodyFace(ctx, c);
    } else if (c.type == CharacterType.Player) {
      this._drawPlayerFace(ctx, c, pointerPosition);
    } else if (c.type == CharacterType.Enemy) {
      this._drawEnemyFace(ctx, c);
    }
  }

  private _drawEnemyFace(ctx: CanvasRenderingContext2D, c: Character) {
    return;
  }

  private _drawPlayerFace(
    ctx: CanvasRenderingContext2D,
    c: Character,
    pointerPosition?: Vector2,
  ) {
    const pcv: Vector2 = [0, 0];
    normalize(pcv, subtract(pcv, pointerPosition ?? c.pos, c.pos));

    ctx.fillStyle = rgbString(darken(c.color, 75));
    const eyePadding = c.size[0] * 0.2;
    const eyeSize = 8;
    const leftEye = add([0, 0], c.center, [-eyePadding, -10]);
    ctx.beginPath();
    ctx.circle(leftEye[0], leftEye[1], eyeSize);
    ctx.fill();
    const rightEye = add([0, 0], c.center, [eyePadding, -10]);
    ctx.circle(rightEye[0], rightEye[1], eyeSize);
    ctx.fill();

    const pupilSize = eyeSize * 0.5;
    const dr = (eyeSize - pupilSize) * 0.5;
    const pd: Vector2 = [0, 0];
    scale(pd, pcv, dr);
    const leftPupil = add([0, 0], leftEye, pd);
    ctx.fillStyle = rgbString(lighten(c.color, 25));
    ctx.circle(leftPupil[0], leftPupil[1], pupilSize);
    ctx.fill();
    const rightPupil = add([0, 0], rightEye, pd);
    ctx.circle(rightPupil[0], rightPupil[1], pupilSize);
    ctx.fill();

    ctx.fillStyle = rgbString(darken(c.color, 95));
    const mouthSize = 10;
    const mouthPadding: Vector2 = [0, c.size[1] * 0.125];
    const mouth = add([0, 0], c.center, pd);
    add(mouth, mouth, mouthPadding);
    ctx.roundRect(mouth[0], mouth[1], mouthSize * 1.5, mouthSize, 0, 0, 4, 4);
    ctx.fill();
    ctx.closePath();
  }

  private _drawPlayerBodyFace(ctx: CanvasRenderingContext2D, c: Character) {
    const eyePadding = c.size[0] * 0.2;
    const leftEye = add([0, 0], c.center, [-eyePadding, -10]);
    const rightEye = add([0, 0], c.center, [eyePadding, -10]);
    const eyeSize = 24;
    const mouth = add([0, 0], c.center, [0, 8]);
    ctx.fillStyle = rgbString(darken(c.color, 75));
    ctx.font = `normal 1000 ${eyeSize}px sans-serif`;
    ctx.fillText('X', leftEye[0], leftEye[1]);
    ctx.fillText('X', rightEye[0], rightEye[1]);
    ctx.beginPath();
    ctx.roundRect(mouth[0], mouth[1], 15, 10, 4);
    ctx.fill();
    ctx.closePath();
  }

  private _drawGhostFace(
    ctx: CanvasRenderingContext2D,
    c: Character,
    pointerPosition?: Vector2,
  ) {
    const pcv: Vector2 = [0, 0];
    normalize(pcv, subtract(pcv, pointerPosition ?? c.pos, c.pos));

    ctx.fillStyle = rgbString(darken(c.color, 75));
    const eyePadding = c.size[0] * 0.2;
    const eyeSize = 8;
    const leftEye = add([0, 0], c.center, [-eyePadding, -10]);
    ctx.beginPath();
    ctx.circle(leftEye[0], leftEye[1], eyeSize);
    ctx.fill();
    const rightEye = add([0, 0], c.center, [eyePadding, -10]);
    ctx.circle(rightEye[0], rightEye[1], eyeSize);
    ctx.fill();

    const pupilSize = eyeSize * 0.5;
    const dr = (eyeSize - pupilSize) * 0.5;
    const pd: Vector2 = [0, 0];
    scale(pd, pcv, dr);
    const leftPupil = add([0, 0], leftEye, pd);
    ctx.fillStyle = rgbString(lighten(c.color, 25));
    ctx.circle(leftPupil[0], leftPupil[1], pupilSize);
    ctx.fill();
    const rightPupil = add([0, 0], rightEye, pd);
    ctx.circle(rightPupil[0], rightPupil[1], pupilSize);
    ctx.fill();

    ctx.fillStyle = rgbString(darken(c.color, 95));
    const mouthSize = 10;
    const mouthPadding: Vector2 = [0, c.size[1] * 0.125];
    const mouth = add([0, 0], c.center, pd);
    add(mouth, mouth, mouthPadding);
    ctx.roundRect(mouth[0], mouth[1], mouthSize * 1.5, mouthSize, 4);
    ctx.fill();
    ctx.closePath();
  }

  private _renderHud(scene: Scene) {
    const ctx = this.ctx;
    const scoreFontSize = 40;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `normal bold ${scoreFontSize}px sans-serif`;
    const score = Math.floor(scene.score);
    ctx.fillText(`${score}`, 100, scoreFontSize);
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
      ctx.strokeStyle = '#FFFFFF';
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
    this._renderCharacter(scene.a, pointerPosition);
    this._renderCharacter(scene.b, pointerPosition);

    for (const e of scene.e) {
      this._renderCharacter(e);
    }

    this._renderHud(scene);
  }
}
