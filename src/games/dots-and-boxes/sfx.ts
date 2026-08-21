/** Notebook sounds for Dots & Boxes — procedural WebAudio, no files. */

export class DotsSfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = false;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 1;
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -20;
        comp.ratio.value = 5;
        comp.attack.value = 0.003;
        comp.release.value = 0.1;
        this.master.connect(comp).connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  unlock(): void {
    const ctx = this.ensure();
    if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.04);
  }

  private buf(): AudioBuffer | null {
    const ctx = this.ensure();
    if (!ctx) return null;
    if (!this.noise) {
      const len = ctx.sampleRate;
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = last * 0.9 + w * 0.1;
        d[i] = last * 4.5;
      }
    }
    return this.noise;
  }

  private burst(at: number, dur: number, freq: number, peak: number, q = 1, type: BiquadFilterType = 'bandpass', sweepTo?: number): void {
    const ctx = this.ensure();
    const buf = this.buf();
    if (!ctx || !buf || !this.master) return;
    const t = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.85 + Math.random() * 0.3;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  private tone(at: number, dur: number, from: number, peak: number, to?: number, type: OscillatorType = 'sine'): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    if (to) o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  /** Pencil scratch for a drawn line. */
  scratch(): void {
    this.burst(0, 0.09, 2400, 0.22, 0.8, 'bandpass', 900);
  }

  /** You claim a box. */
  pop(nth = 0): void {
    this.tone(0, 0.12, 520 + nth * 90, 0.24, 700 + nth * 90, 'triangle');
  }

  /** Rival claims a box. */
  rivalPop(nth = 0): void {
    this.tone(0, 0.12, 340 - nth * 20, 0.2, 250, 'triangle');
  }

  win(): void {
    for (const [i, f] of [523, 659, 784, 1047].entries()) this.tone(i * 0.09, 0.16, f, 0.2, undefined, 'triangle');
    this.burst(0.15, 1.0, 520, 0.16, 3.5, 'bandpass', 900);
  }

  lose(): void {
    for (const [i, f] of [392, 330, 262].entries()) this.tone(i * 0.12, 0.2, f, 0.15, undefined, 'triangle');
  }

  dispose(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
      this.noise = null;
    }
  }
}
