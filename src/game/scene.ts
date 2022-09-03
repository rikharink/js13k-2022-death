import { lerp as vlerp } from '../math/vector2';
import { Character } from './character';
import { lerp } from '../math/util';

export interface Scene {
  a: Character;
  a_body?: Character;

  b: Character;
  b_body?: Character;

  e: Character[];

  score: number;
}

export function interpolateScene(
  current: Scene,
  previous: Scene,
  alpha: number,
) {
  //TODO: interpolate enemy positions?
  const e: Character[] = [];
  for (const ce of current.e) {
    const pe = previous.e.find((x) => x.id === ce.id);
    if (pe) {
      e.push(interpolateCharacter(pe, ce, alpha));
    } else {
      e.push(ce);
    }
  }
  const a = interpolateCharacter(previous.a, current.a, alpha);
  const b = interpolateCharacter(previous.b, current.b, alpha);
  return {
    a,
    b,
    e,
    a_body: current.a_body,
    b_body: current.b_body,
    score: lerp(previous.score, current.score, alpha),
  };
}

function interpolateCharacter(
  p: Character,
  n: Character,
  alpha: number,
): Character {
  return new Character({ ...n, pos: vlerp([0, 0], p.pos, n.pos, alpha) });
}
