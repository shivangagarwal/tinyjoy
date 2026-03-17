/**
 * Score tracking and personal best via localStorage.
 */
export class ScoreTracker {
  private key: string;
  private _score = 0;

  constructor(gameKey: string) {
    this.key = `tinyjoy:score:${gameKey}`;
  }

  get score(): number {
    return this._score;
  }

  get personalBest(): number {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(this.key) ?? '0', 10);
  }

  add(points: number): number {
    this._score += points;
    return this._score;
  }

  reset(): void {
    this._score = 0;
  }

  /** Save current score if it's a new personal best. Returns true if new best. */
  save(): boolean {
    const best = this.personalBest;
    if (this._score > best) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.key, String(this._score));
      }
      return true;
    }
    return false;
  }

  isNewBest(): boolean {
    return this._score > this.personalBest;
  }
}
