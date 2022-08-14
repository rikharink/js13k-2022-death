import { AudioManager } from '../audio/audio-manager';
import { playKick } from '../audio/instruments/kick';
import { stats } from '../debug/gui';
import { add, normalize, scale, subtract, Vector2 } from '../math/vector2';
import { CanvasRenderer } from '../rendering/canvas/canvas-renderer';
import { Renderer } from '../rendering/renderer';
import settings from '../settings';
import { Milliseconds, Seconds } from '../types';
import { Character } from './character';
import { InputManager } from './input-manager';
import { Scene } from './scene';

export class Game {
  private _running = true;
  private _handle = 0;
  private _then?: number;
  private _t = 0;
  private _accumulator = 0;
  private _stepcount = 0;
  private _input: InputManager;
  private _audioManager?: AudioManager;
  private _currentScene!: Scene;

  private _audioInitHandler: () => void = (() => {
    console.log('init audio');
    this._audioManager = new AudioManager();
    this.renderer.canvas.canvas.removeEventListener(
      'click',
      this._audioInitHandler,
    );
  }).bind(this);

  public renderer: Renderer;
  public monetized = false;
  public charactersBound = true;
  private _framecount: any;

  constructor(renderer: Renderer) {
    this._setupScene();
    this.renderer = renderer;
    this._input = new InputManager(renderer.canvas.canvas);
    renderer.canvas.canvas.addEventListener('click', this._audioInitHandler);
    this.monetized = document.monetization?.state === 'started';
    if (this.monetized) {
      console.log('Monetization immediatly started');
    } else {
      console.log('Monetization immediatly stopped');
    }
    if (document.monetization) {
      document.monetization.addEventListener(
        'monetizationstart',
        (() => {
          this.monetized = true;
          console.log('Monetization enabled!');
        }).bind(this),
      );

      document.monetization.addEventListener(
        'monetizationstop',
        (() => {
          this.monetized = false;
          console.log('Monetization stopped!');
        }).bind(this),
      );
    } else {
      console.log('No webmonetization API found');
    }
  }

  private _setupScene() {
    const [w, h] = settings.rendererSettings.resolution;
    const hw = w * 0.5;
    const hh = h * 0.5;
    const cw = 42;
    const ch = 64;
    const hcw = cw * 0.5;
    const hch = ch * 0.5;
    const cp = 2;
    const char_size: Vector2 = [cw, ch];

    const a = new Character({
      pos: [hw - hcw - cp, hh],
      size: char_size,
      color: [255, 0, 0],
      name: 'a',
    });

    const b = new Character({
      pos: [hw + hcw + cp, hh],
      size: char_size,
      color: [0, 255, 0],
      name: 'b',
    });

    this._currentScene = new Scene(a, b);
  }

  loop(now: Milliseconds) {
    if (process.env.NODE_ENV === 'development') {
      stats.begin();
    }
    this._handle = requestAnimationFrame(this.loop.bind(this));
    if (this._then) {
      const ft = now - this._then;
      if (ft > 1000) {
        this._then = now;
        return;
      }

      this._accumulator += ft;

      while (this._accumulator >= settings.dt) {
        this._t += settings.dt;
        //DO FIXED STEP STUFF
        this._updatePlayer();
        this._updateEnemies();
        this._stepcount++;
        this._accumulator -= settings.dt;
      }
      const alpha = this._accumulator / settings.dt;
      //DO VARIABLE STEP STUFF
      this._framecount++;
      this._audioManager?.tick();
      this._processInput();
      this.renderer.render(this._currentScene, this._input.pointerPosition);
    }
    this._then = now;
    if (process.env.NODE_ENV === 'development') {
      stats.end();
    }
  }

  private _updateEnemies() {
    for (const e of this._currentScene.e) {
      const closest = e.closest(this._currentScene.a, this._currentScene.b);
      const movement: Vector2 = [0, 0];
      normalize(movement, subtract(movement, e.center, closest.center));
      subtract(e.pos, e.pos, movement);
    }

    if (this._stepcount % 100 === 0 && this._currentScene.e.length < 10) {
      this._currentScene.spawnEnemy();
      console.log('Enemy count:', this._currentScene.e.length);
    }
  }

  private _updatePlayer() {
    const mouse_pos = this._input.pointerPosition;
    const bound = this.charactersBound;
    const a = this._currentScene.a;
    const b = this._currentScene.b;
    const a_pos = a.center;
    const b_pos = b.center;

    if (bound && (a.followPointer || b.followPointer)) {
      const target: Vector2 = [0, 0];
      scale(target, add(target, a_pos, b_pos), 0.5);
      const movement: Vector2 = [0, 0];
      normalize(movement, subtract(movement, target, mouse_pos));
      subtract(a.pos, a.pos, movement);
      subtract(b.pos, b.pos, movement);
      return;
    }

    if (a.followPointer) {
      const movement: Vector2 = [0, 0];
      normalize(movement, subtract(movement, a_pos, mouse_pos));
      subtract(a.pos, a.pos, movement);
    }

    if (b.followPointer) {
      const movement: Vector2 = [0, 0];
      normalize(movement, subtract(movement, b_pos, mouse_pos));
      subtract(b.pos, b.pos, movement);
    }
  }

  public start() {
    this._running = true;
    this._handle = requestAnimationFrame(this.loop.bind(this));
  }

  public stop() {
    this._running = false;
    this._then = undefined;
    cancelAnimationFrame(this._handle);
  }

  public toggle() {
    this._running = !this._running;
    this._running ? this.start() : this.stop();
  }

  private _processInput() {
    if (this._input.hasPointerUp(0)) {
      this._currentScene.a.followPointer = !this._currentScene.a.followPointer;
      if (this.charactersBound) {
        this._currentScene.b.followPointer = this._currentScene.a.followPointer;
      }
    }

    if (this._input.hasPointerUp(2)) {
      this._currentScene.b.followPointer = !this._currentScene.b.followPointer;
      if (this.charactersBound) {
        this._currentScene.a.followPointer = this._currentScene.b.followPointer;
      }
    }

    if (this._input.hasKeyUp('m')) {
      this._audioManager?.toggleMute();
    }

    this._input.tick();
  }
}
