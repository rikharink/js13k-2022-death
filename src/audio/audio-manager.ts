import { Bpm, Seconds } from '../types';
import { playKick } from './instruments/kick';
import { playHh } from './instruments/hh';
import defaultSong from './songs';
import { SfxTrigger } from './types';
import { Song } from './song';
import { createDubDelay } from './effects/dubdelay';
import { createReverb } from './effects/reverb';

interface AudioManagerOptions {
  tempo: Bpm;
}

export class AudioManager {
  private _music: GainNode;
  private _sfx: GainNode;
  private _master: GainNode;
  private _ctx: AudioContext;
  private _tempo: Bpm;
  private _noteIndex = 0;
  private _muted = false;
  private _currentSong = defaultSong;
  private _dubDelay: AudioNode;
  private _dubInput: AudioNode;
  private _reverb: AudioNode;
  private _reverbSend: AudioNode;

  public get ctx(): AudioContext {
    return this._ctx;
  }

  public get destination(): AudioNode {
    return this._master;
  }

  private get _secondsPerBeat(): Seconds {
    return 1 / (this._tempo / 60.0);
  }

  private get _sixteenthTiming(): Seconds {
    return this._secondsPerBeat * 0.25;
  }

  public constructor({ tempo = 128 }: Partial<AudioManagerOptions> = {}) {
    this._ctx = new AudioContext();
    this._master = this._ctx.createGain();
    this._master.connect(this._ctx.destination);

    this._music = this._ctx.createGain();
    this._music.connect(this._master);

    this._sfx = this._ctx.createGain();
    this._sfx.connect(this._master);
    this._tempo = tempo;

    this._dubDelay = createDubDelay(this._ctx);
    this._dubDelay.connect(this._music);

    this._dubInput = this._ctx.createGain();
    this._dubInput.connect(this._music);
    this._dubInput.connect(this._dubDelay);

    this._reverb = createReverb(this._ctx, 1);
    this._reverb.connect(this._music);

    this._reverbSend = this._ctx.createGain();
    this._reverbSend.connect(this._music);
    this._reverbSend.connect(this._reverb);
  }

  private _mute() {
    this._muted = true;
    this._master.gain.exponentialRampToValueAtTime(
      0.0001,
      this._ctx.currentTime + 0.2,
    );
  }

  private _unmute() {
    this._muted = false;
    this._master.gain.exponentialRampToValueAtTime(
      1,
      this._ctx.currentTime + 0.2,
    );
  }

  public toggleMute(shouldMute = !this._muted) {
    shouldMute ? this._mute() : this._unmute();
  }

  public connect(node: AudioDestinationNode) {
    node.connect(this._master);
  }

  private _startAudioTime: Seconds | null = null;
  private _elapsedAudioTime: Seconds = 0;

  public tick() {
    const kick_pattern =
      this._currentSong.kick.notes[
        this._currentSong.kick.index % this._currentSong.kick.notes.length
      ];
    const hh_pattern =
      this._currentSong.hh.notes[
        this._currentSong.hh.index % this._currentSong.hh.notes.length
      ];
    const ctx: AudioContext = this.ctx;
    const output: AudioNode = this._music;
    if (this._startAudioTime == null) {
      this._startAudioTime = ctx.currentTime;
    }
    this._elapsedAudioTime = ctx.currentTime - this._startAudioTime;

    if (this._elapsedAudioTime >= this._sixteenthTiming) {
      if (hh_pattern[this._noteIndex % hh_pattern.length]) {
        playHh(ctx.currentTime, ctx, this._reverbSend);
      }
      if (kick_pattern[this._noteIndex % kick_pattern.length]) {
        playKick(ctx.currentTime, ctx, output);
      }
      this._noteIndex++;
      this._startAudioTime = ctx.currentTime;
      if (this._noteIndex === 0) return;
      if (
        this._noteIndex %
          this._currentSong.kick.notes[this._currentSong.kick.index].length ===
        0
      ) {
        this._currentSong.kick.index =
          (this._currentSong.kick.index + 1) %
          this._currentSong.kick.notes.length;
      }

      if (
        this._noteIndex %
          this._currentSong.hh.notes[this._currentSong.hh.index].length ===
        0
      ) {
        this._currentSong.hh.index =
          (this._currentSong.hh.index + 1) % this._currentSong.hh.notes.length;
      }
    }
  }

  public playSfx(trigger: SfxTrigger, delay = 0) {
    trigger(this._ctx.currentTime + delay, this._ctx, this._sfx);
  }

  public playSong(song: Song) {
    this._currentSong = song;
  }
}
