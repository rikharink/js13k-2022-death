import { Seconds } from '../../types';
import { whiteNoise } from '../util';

export function playHh(when: Seconds, ctx: AudioContext, output?: AudioNode) {
  const noise = whiteNoise(ctx);
  const gain = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  const hp = ctx.createBiquadFilter();
  hp.frequency.setValueAtTime(400, when);
  hp.type = 'highpass';
  gain.gain.setValueAtTime(0.5, when);
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(9000, when);
  noise.connect(gain);
  gain.connect(hp);
  hp.connect(lp);
  lp.connect(output || ctx.destination);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
  noise.start();
  noise.stop(when + 0.2);
}
