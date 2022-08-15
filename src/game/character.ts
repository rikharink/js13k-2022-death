import { hasRectangleRectangleCollision } from '../geometry/collision-checks';
import { Rectangle } from '../geometry/rectangle';
import { distance_squared, Vector2, lerp } from '../math/vector2';
import { RgbColor, UUIDV4 } from '../types';
import { uuidv4 } from '../util';

interface CharacterOptions {
  pos: Vector2;
  size: Vector2;
  color: RgbColor;
  name: string;
  speed: number;
  health: number;
  status: Status;
  type: CharacterType;
}

export const enum Status {
  Alive,
  Dead,
}

export const enum CharacterType {
  Player,
  PlayerBody,
  Enemy,
}

export class Character {
  public id: UUIDV4 = uuidv4(Math.random);
  public pos: Vector2;
  public color: RgbColor;
  public size: Vector2;
  public name: string;
  public speed: number;
  public health: number;
  public status: Status;
  public followPointer: boolean;
  public target?: Character;
  public type: CharacterType;

  constructor({
    pos = [0, 0],
    size = [64, 64],
    color = [0, 0, 255],
    name = 'UNINIT',
    speed = 1,
    health = 100,
    status = Status.Alive,
    type = CharacterType.Enemy,
  }: Partial<CharacterOptions>) {
    this.pos = pos;
    this.size = size;
    this.color = color;
    this.name = name;
    this.health = health;
    this.speed = speed;
    this.status = status;
    this.type = type;
    this.followPointer = false;
  }

  public get center(): Vector2 {
    return [this.pos[0] + this.size[0] * 0.5, this.pos[1] + this.size[1] * 0.5];
  }

  public getRect(): Rectangle {
    return new Rectangle(this.pos, this.size);
  }

  public closest(...characters: Character[]): Character {
    const distances = characters.map((c) => {
      return { c: c, d: distance_squared(this.pos, c.pos) };
    });
    let min_c: Character | null = null;
    let min_distance = Number.MAX_VALUE;
    for (const d of distances) {
      if (d.d < min_distance) {
        min_distance = d.d;
        min_c = d.c;
      }
    }
    return min_c!;
  }

  public collidesWith(other: Character): boolean {
    return hasRectangleRectangleCollision(this.getRect(), other.getRect());
  }

  public isAlive() {
    return this.status == Status.Alive;
  }

  public isDead() {
    return this.status == Status.Dead;
  }

  public getBody(): Character {
    return new Character({
      ...this,
      type: CharacterType.PlayerBody,
      status: Status.Alive,
    });
  }
}
