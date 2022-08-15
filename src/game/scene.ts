import { lerp } from '../math/vector2';
import { Character } from './character';

export interface Scene {
  a: Character;
  a_body?: Character;

  b: Character;
  b_body?: Character;

  e: Character[];
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

  return {
    a: interpolateCharacter(previous.a, current.a, alpha),
    b: interpolateCharacter(previous.b, current.b, alpha),
    e,
    a_body: current.a_body,
    b_body: current.b_body,
  };
}

function interpolateCharacter(
  p: Character,
  n: Character,
  alpha: number,
): Character {
  return new Character({
    ...p,
    pos: lerp([0, 0], p.pos, n.pos, alpha),
  });
}
