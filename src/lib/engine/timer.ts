/**
 * Countdown timer for timed games.
 */
export class GameTimer {
  private totalMs: number;
  private remainingMs: number;
  private lastTick: number | null = null;
  private rafId: number | null = null;
  private _running = false;

  onTick?: (remaining: number, total: number) => void;
  onComplete?: () => void;

  constructor(durationSec: number) {
    this.totalMs = durationSec * 1000;
    this.remainingMs = this.totalMs;
  }

  get remaining(): number {
    return Math.max(0, this.remainingMs) / 1000;
  }

  get total(): number {
    return this.totalMs / 1000;
  }

  get progress(): number {
    return 1 - this.remainingMs / this.totalMs;
  }

  get running(): boolean {
    return this._running;
  }

  start(): void {
    if (this._running) return;
    this._running = true;
    this.lastTick = performance.now();
    this._tick();
  }

  pause(): void {
    this._running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTick = null;
  }

  resume(): void {
    if (this._running) return;
    this.start();
  }

  reset(durationSec?: number): void {
    this.pause();
    if (durationSec !== undefined) {
      this.totalMs = durationSec * 1000;
    }
    this.remainingMs = this.totalMs;
  }

  private _tick(): void {
    if (!this._running) return;

    const now = performance.now();
    const delta = now - (this.lastTick ?? now);
    this.lastTick = now;
    this.remainingMs = Math.max(0, this.remainingMs - delta);

    this.onTick?.(this.remaining, this.total);

    if (this.remainingMs <= 0) {
      this._running = false;
      this.rafId = null;
      this.onComplete?.();
      return;
    }

    this.rafId = requestAnimationFrame(() => this._tick());
  }
}
