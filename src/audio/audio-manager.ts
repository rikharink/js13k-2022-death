export class AudioManager {
  private _previousGain?: number;
  private _master: GainNode;
  private _ctx!: AudioContext;

  public constructor() {
    this._ctx = new AudioContext();
    this._master = this._ctx.createGain();
    this._master.connect(this._ctx.destination);
  }

  public mute() {
    this._previousGain = this._master.gain.value;
    this._master.gain.setValueAtTime(0, 0);
  }

  public unmute() {
    this._master.gain.setValueAtTime(this._previousGain ?? 1, 0);
  }

  public connect(node: AudioNode) {
    node.connect(this._master);
  }
}
