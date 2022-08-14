import { Bpm, Seconds } from '../types';
import { playKick } from './instruments/kick';
import { playHh } from './instruments/hh';
import defaultSong from './songs';
import { SfxTrigger } from './types';
import { Song } from './song';
import { createDubDelay } from './effects/dubdelay';

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
  private _barIndex = 0;
  private _muted = false;
  private _currentSong = defaultSong;
  private _dubDelay: AudioNode;
  private _dubInput: AudioNode;

  public get ctx(): AudioContext {
    return this._ctx;
  }

  public get destination(): AudioNode {
    return this._master;
  }

  private get _sixteenthTiming(): Seconds {
    return (this._tempo / 60.0) * 0.0625;
  }

  private get _quarterTiming(): Seconds {
    return (this._tempo / 60.0) * 0.25;
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
      this._currentSong.kick[this._barIndex % this._currentSong.kick.length];
    const hh_pattern =
      this._currentSong.hh[this._barIndex % this._currentSong.hh.length];
    const ctx: AudioContext = this.ctx;
    const output: AudioNode = this._music;
    if (this._startAudioTime == null) {
      this._startAudioTime = ctx.currentTime;
    }
    this._elapsedAudioTime = ctx.currentTime - this._startAudioTime;

    if (this._elapsedAudioTime >= this._sixteenthTiming) {
      if (hh_pattern.includes(this._noteIndex)) {
        playHh(ctx.currentTime, ctx, output);
      }
      if (kick_pattern.includes(this._noteIndex)) {
        playKick(ctx.currentTime, ctx, output);
      }

      this._noteIndex++;
      if (this._noteIndex == 16) {
        this._barIndex++;
        this._barIndex = this._barIndex % 16;
        this._noteIndex = 0;
      }
      this._startAudioTime = ctx.currentTime;
    }
  }

  public playSfx(trigger: SfxTrigger, delay = 0) {
    trigger(this._ctx.currentTime + delay, this._ctx, this._sfx);
  }

  public playSong(song: Song) {
    this._currentSong = song;
  }
}
