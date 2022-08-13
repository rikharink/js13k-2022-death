import { distance_squared, Vector2 } from '../math/vector2';
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
}

export const enum Status {
  Alive,
  Dead,
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

  constructor({
    pos = [0, 0],
    size = [64, 64],
    color = [0, 0, 255],
    name = 'UNINIT',
    speed = 1,
    health = 100,
    status = Status.Alive,
  }: Partial<CharacterOptions>) {
    this.pos = pos;
    this.size = size;
    this.color = color;
    this.name = name;
    this.health = health;
    this.speed = speed;
    this.status = status;
  }

  public get center(): Vector2 {
    return [this.pos[0] + this.size[0] * 0.5, this.pos[1] + this.size[1] * 0.5];
  }

  public closest(a: Character, b: Character): Character {
    const da = distance_squared(this.pos, a.pos);
    const db = distance_squared(this.pos, b.pos);
    return da < db ? a : b;
  }
}
