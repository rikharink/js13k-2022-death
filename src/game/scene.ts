import settings from '../settings';
import { Character } from './character';

export class Scene {
  public a: Character;
  public b: Character;
  public e: Character[];

  constructor(a: Character, b: Character) {
    this.a = a;
    this.b = b;
    this.e = [];
  }

  public spawnEnemy() {
    this.e.push(
      new Character({
        pos: [0, settings.rendererSettings.resolution[1]],
        size: [32, 32],
        color: [0, 0, 0],
        name: 'e',
      }),
    );
  }
}
