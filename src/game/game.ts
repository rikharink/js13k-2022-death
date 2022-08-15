import { AudioManager } from '../audio/audio-manager';
import { stats } from '../debug/gui';
import { add, normalize, scale, subtract, Vector2 } from '../math/vector2';
import { Renderer } from '../rendering/renderer';
import settings from '../settings';
import { Milliseconds } from '../types';
import { Character, CharacterType, Status } from './character';
import { InputManager } from './input-manager';
import { interpolateScene, Scene } from './scene';

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
  private _previousScene?: Scene;

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
  private _framecount = 0;

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
    const cw = 64;
    const ch = 64;
    const hcw = cw * 0.5;
    const hch = ch * 0.5;
    const cp = 2;
    const char_size: Vector2 = [cw, ch];

    const a = new Character({
      pos: [hw - hcw - cp, hh],
      size: char_size,
      color: [255, 128, 176],
      name: 'a',
      type: CharacterType.Player,
    });

    const b = new Character({
      pos: [hw + hcw + cp, hh],
      size: char_size,
      color: [148, 140, 222],
      name: 'b',
      type: CharacterType.Player,
    });

    this._currentScene = { a: a, b: b, e: [] };
  }

  private _reset() {
    this._setupScene();
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
        this._updateEnemies();
        this._updatePlayer();
        this._stepcount++;
        this._accumulator -= settings.dt;
      }
      const alpha = this._accumulator / settings.dt;
      //DO VARIABLE STEP STUFF
      this._framecount++;
      this._audioManager?.tick();
      this._processInput();
      const interpolatedScene = this._previousScene
        ? interpolateScene(this._currentScene, this._previousScene, alpha)
        : this._currentScene;
      this.renderer.render(interpolatedScene, this._input.pointerPosition);
      this._previousScene = JSON.parse(JSON.stringify(this._currentScene));
    }
    this._then = now;
    if (process.env.NODE_ENV === 'development') {
      stats.end();
    }
  }

  private static _getTarget(a: Character, b: Character, closest: Character) {
    if (a.isDead()) {
      return b;
    }
    if (b.isDead()) {
      return a;
    }
    return closest;
  }

  private _spawnEnemy() {
    this._currentScene.e.push(
      new Character({
        pos: [0, settings.rendererSettings.resolution[1]],
        size: [32, 32],
        color: [174, 247, 189],
        name: 'e',
      }),
    );
  }

  private _updateEnemies() {
    const a = this._currentScene.a;
    const b = this._currentScene.b;
    for (const e of this._currentScene.e) {
      const closest = e.closest(a, b);
      e.target = Game._getTarget(a, b, closest);
      const movement: Vector2 = [0, 0];
      normalize(movement, subtract(movement, e.center, e.target.center));
      subtract(e.pos, e.pos, movement);

      if (a.health > 0 && e.collidesWith(a)) {
        a.health--;
      }
      if (b.health > 0 && e.collidesWith(b)) {
        b.health--;
      }
    }

    if (this._stepcount % 100 === 0 && this._currentScene.e.length < 10) {
      this._spawnEnemy();
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

    if (a.isAlive() && a.health <= 0) {
      a.status = Status.Dead;
      this._currentScene.a_body = a.getBody();
      //TODO: randomize or something?
      a.pos = [0, 0];
    }

    if (b.isAlive() && b.health <= 0) {
      b.status = Status.Dead;
      this._currentScene.b_body = b.getBody();
      //TODO: randomize or something?
      b.pos = [0, 0];
    }

    if (a.isDead() && a.collidesWith(this._currentScene.a_body!)) {
      this._currentScene.a_body = undefined;
      a.status = Status.Alive;
      a.health = 100;
    }

    if (b.isDead() && b.collidesWith(this._currentScene.b_body!)) {
      this._currentScene.b_body = undefined;
      b.status = Status.Alive;
      b.health = 100;
    }

    if (a.isDead() && b.isDead()) {
      //TODO: GAME OVER
    }

    this.charactersBound = a.isAlive() && b.isAlive();
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
