import { Seconds } from '../../types';
import { createDistortionNode } from '../effects/distortion';

export function playKick(when: Seconds, ctx: AudioContext, output?: AudioNode) {
  const decay = 1;
  const dist = 25;
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();
  const distortion = createDistortionNode(ctx, dist);
  osc.connect(gain);
  osc.frequency.setValueAtTime(150, when);
  gain.gain.setValueAtTime(0.5, when);
  osc.frequency.exponentialRampToValueAtTime(0.1, when + decay);
  gain.gain.exponentialRampToValueAtTime(0.1, when + decay);
  gain.connect(distortion);
  distortion.connect(output || ctx.destination);
  gain.gain.setValueAtTime(0.01, when + decay);
  osc.start(when);
  osc.stop(when + decay + 0.01);
}
