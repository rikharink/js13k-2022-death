import { Frequency } from '../types';

export interface DubDelayParams {
  delay: number;
  feedback: number;
  frequency: Frequency;
}

export function createDubDelay(
  ctx: AudioContext,
  {
    delay = 0.5,
    feedback = 0.8,
    frequency = 1000,
  }: Partial<DubDelayParams> = {},
): AudioNode {
  const delayNode = ctx.createDelay();
  delayNode.delayTime.setValueAtTime(delay, ctx.currentTime);

  const feedbackNode = ctx.createGain();
  feedbackNode.gain.setValueAtTime(feedback, ctx.currentTime);

  const filterNode = ctx.createBiquadFilter();
  filterNode.frequency.setValueAtTime(frequency, ctx.currentTime);

  delayNode.connect(feedbackNode);
  feedbackNode.connect(filterNode);
  filterNode.connect(delayNode);

  return delayNode;
}
