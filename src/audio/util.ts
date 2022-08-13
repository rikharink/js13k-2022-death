import { Tone, Frequency, Note, Octave, Mode, Chord } from './types';

export async function loadAudioWorklet(ctx: AudioContext, source: string) {
  await ctx.audioWorklet.addModule(
    URL.createObjectURL(new Blob([source], { type: 'text/javascript' })),
  );
}

let _whiteNoiseBuffer: AudioBuffer | undefined;
export function whiteNoise(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = 2 * ctx.sampleRate;
  if (!_whiteNoiseBuffer || _whiteNoiseBuffer.length !== bufferSize) {
    _whiteNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = _whiteNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }
  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = _whiteNoiseBuffer;
  whiteNoise.loop = true;
  return whiteNoise;
}

export function noteToFrequency(note: Tone): Frequency {
  return 440 * Math.pow(2.0, ((note.octave - 4) * 12 + note.note) / 12.0);
}

export function addSemitones(note: Tone, semitones: number): Tone {
  let n = note.note + semitones;
  let o = note.octave;
  while (n < 0) {
    n = 12 - n;
    o--;
  }
  while (n >= 12) {
    n -= 12;
    o++;
  }
  return {
    note: n as Note,
    octave: o as Octave,
  };
}

export function getTriad(note: Tone, mode: Mode): Chord {
  const chord: Chord = [];
  chord.push(note);
  chord.push(addSemitones(note, mode === Mode.Minor ? 3 : 4));
  chord.push(addSemitones(note, 7));
  return chord;
}

export function chordToFrequencies(chord: Chord): Frequency[] {
  return chord.map(noteToFrequency);
}
