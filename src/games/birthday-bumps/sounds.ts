/**
 * All-procedural party audio for GPL: Birthday Bumps — WebAudio only, no
 * audio files. A murmuring-crowd bed (filtered noise with slow swells and
 * random chatter blips), chappal thwacks, swing whooshes, an "OOOH" on
 * perfect hits, and a cheer at the end.
 */

export class PartyAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private bedGain: GainNode | null = null;
  private ambience: AudioNode[] = [];
  private chatterTimer: ReturnType<typeof setInterval> | null = null;
  private intensity = 1;
  private muted = false;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 1;
        this.master.connect(this.ctx.destination);
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

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  get isMuted(): boolean {
    return this.muted;
  }

  private noiseBuffer(): AudioBuffer | null {
    const ctx = this.ensure();
    if (!ctx) return null;
    if (!this.noise) {
      const len = ctx.sampleRate * 2;
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        // pink-ish: soften white noise so the bed sounds like a room, not static
        const white = Math.random() * 2 - 1;
        last = last * 0.94 + white * 0.06;
        data[i] = last * 6;
      }
    }
    return this.noise;
  }

  /** Short filtered-noise hit. */
  private burst(opts: { at?: number; dur: number; freq: number; q?: number; peak: number; type?: BiquadFilterType; sweepTo?: number }): void {
    const ctx = this.ensure();
    const buf = this.noiseBuffer();
    if (!ctx || !buf || !this.master) return;
    const t = ctx.currentTime + (opts.at ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.type ?? 'bandpass';
    filter.frequency.setValueAtTime(opts.freq, t);
    if (opts.sweepTo) filter.frequency.exponentialRampToValueAtTime(opts.sweepTo, t + opts.dur);
    filter.Q.value = opts.q ?? 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(opts.peak, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + opts.dur);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + opts.dur + 0.05);
  }

  private tone(opts: { at?: number; dur: number; from: number; to?: number; peak: number; type?: OscillatorType; pan?: number }): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + (opts.at ?? 0);
    const osc = ctx.createOscillator();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(opts.from, t);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), t + opts.dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(opts.peak, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + opts.dur);
    let head: AudioNode = gain;
    if (opts.pan !== undefined && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = opts.pan;
      gain.connect(panner);
      head = panner;
    }
    osc.connect(gain);
    head.connect(this.master);
    osc.start(t);
    osc.stop(t + opts.dur + 0.05);
  }

  // ── The crowd ──────────────────────────────────────────────────────────

  startAmbience(): void {
    const ctx = this.ensure();
    const buf = this.noiseBuffer();
    if (!ctx || !buf || !this.master || this.bedGain) return;

    // low murmur bed
    const bed = ctx.createBufferSource();
    bed.buffer = buf;
    bed.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 480;
    this.bedGain = ctx.createGain();
    this.bedGain.gain.value = 0.05;
    bed.connect(lowpass).connect(this.bedGain).connect(this.master);
    bed.start();

    // two slow LFOs at different rates make the murmur swell organically
    const lfos: AudioNode[] = [];
    for (const [rate, depth] of [
      [0.13, 0.02],
      [0.31, 0.012],
    ] as const) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rate;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = depth;
      lfo.connect(lfoGain).connect(this.bedGain.gain);
      lfo.start();
      lfos.push(lfo, lfoGain);
    }
    this.ambience = [bed, lowpass, this.bedGain, ...lfos];

    // chatter: quiet, indistinct voice-ish blips scattered around the room
    this.chatterTimer = setInterval(() => {
      const chance = this.intensity > 1 ? 0.55 : 0.34;
      if (Math.random() > chance) return;
      const base = 140 + Math.random() * 260;
      this.tone({
        dur: 0.05 + Math.random() * 0.09,
        from: base,
        to: base * (0.8 + Math.random() * 0.5),
        peak: 0.008 + Math.random() * 0.012,
        type: Math.random() < 0.5 ? 'triangle' : 'sine',
        pan: (Math.random() * 2 - 1) * 0.7,
      });
    }, 130);
  }

  stopAmbience(): void {
    if (this.chatterTimer) clearInterval(this.chatterTimer);
    this.chatterTimer = null;
    if (this.ctx && this.bedGain) {
      this.bedGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
    const nodes = this.ambience;
    setTimeout(() => {
      nodes.forEach((n) => {
        try {
          (n as AudioScheduledSourceNode).stop?.();
          n.disconnect();
        } catch {
          // already stopped
        }
      });
    }, 600);
    this.ambience = [];
    this.bedGain = null;
    this.intensity = 1;
  }

  /** 2 = final-ten-seconds energy: busier chatter, louder bed. */
  setIntensity(level: 1 | 2): void {
    this.intensity = level;
    if (this.ctx && this.bedGain) {
      this.bedGain.gain.setTargetAtTime(level === 2 ? 0.075 : 0.05, this.ctx.currentTime, 0.5);
    }
  }

  // ── One-shots ──────────────────────────────────────────────────────────

  swing(): void {
    this.burst({ dur: 0.16, freq: 1900, sweepTo: 380, q: 0.9, peak: 0.1 });
  }

  thwack(perfect: boolean): void {
    // bass thump + leathery crack
    this.tone({ dur: 0.1, from: 150, to: 85, peak: perfect ? 0.5 : 0.4 });
    this.burst({ dur: 0.07, freq: 1300, q: 0.8, peak: perfect ? 0.42 : 0.3 });
    if (perfect) {
      this.burst({ at: 0.012, dur: 0.05, freq: 2600, q: 1.2, peak: 0.22 });
      // crowd OOOH: a vowel-ish swell
      this.burst({ at: 0.09, dur: 0.85, freq: 420, sweepTo: 640, q: 4, peak: 0.12 });
      this.burst({ at: 0.12, dur: 0.7, freq: 300, q: 3, peak: 0.07 });
    }
  }

  blocked(): void {
    this.burst({ dur: 0.09, freq: 240, q: 0.7, peak: 0.24, type: 'lowpass' });
    this.tone({ dur: 0.2, from: 290, to: 140, peak: 0.1, type: 'triangle' });
  }

  cheer(): void {
    for (const [i, f] of [523, 659, 784].entries()) {
      this.tone({ at: i * 0.09, dur: 0.16, from: f, peak: 0.14, type: 'triangle' });
    }
    this.burst({ at: 0.1, dur: 1.3, freq: 500, sweepTo: 800, q: 3.5, peak: 0.14 });
    this.burst({ at: 0.15, dur: 1.1, freq: 340, q: 3, peak: 0.08 });
  }

  dispose(): void {
    this.stopAmbience();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
      this.noise = null;
    }
  }
}
