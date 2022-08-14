import { Seconds } from '../../types';

export function playKick(when: Seconds, ctx: AudioContext, output?: AudioNode) {
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();
  osc.connect(gain);
  gain.connect(output || ctx.destination);
  osc.frequency.setValueAtTime(150, when);
  gain.gain.setValueAtTime(1, when);
  osc.frequency.exponentialRampToValueAtTime(0.01, when + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.01, when + 0.5);
  osc.start(when);
  osc.stop(when + 0.5);
}
