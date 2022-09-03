import { makeDistortionCurve } from '../util';

export function createDistortionNode(ctx: AudioContext, amount?: number) {
  const node = ctx.createWaveShaper();
  node.curve = makeDistortionCurve(amount);
  return node;
}
