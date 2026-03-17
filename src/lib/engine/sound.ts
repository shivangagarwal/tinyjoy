/**
 * Sound effect manager using Web Audio API.
 * Generates tones procedurally — no external assets needed.
 */

export type SoundEffect = 'tap' | 'success' | 'error' | 'tick';

interface ToneConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;
  gainPeak: number;
}

const SOUNDS: Record<SoundEffect, ToneConfig> = {
  tap: { frequency: 660, type: 'sine', duration: 0.06, gainPeak: 0.25 },
  success: { frequency: 880, type: 'sine', duration: 0.18, gainPeak: 0.3 },
  error: { frequency: 220, type: 'sawtooth', duration: 0.2, gainPeak: 0.2 },
  tick: { frequency: 440, type: 'square', duration: 0.04, gainPeak: 0.15 },
};

export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;

  private _getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  play(effect: SoundEffect): void {
    if (this.muted) return;
    const ctx = this._getCtx();
    if (!ctx) return;

    const cfg = SOUNDS[effect];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.frequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(cfg.gainPeak, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + cfg.duration + 0.01);
  }

  /** Unlock AudioContext on first user gesture (required by browsers). */
  unlock(): void {
    const ctx = this._getCtx();
    if (ctx?.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }
}
