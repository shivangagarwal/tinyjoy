/**
 * The rival's brain: remembers what you throw (frequency) and what you throw
 * after each result (transition), predicts your next, and counters it — most
 * of the time. A short streak cap keeps it from feeling rigged.
 */

export type Throw = 0 | 1 | 2; // stone, paper, scissors
export const THROWS: Throw[] = [0, 1, 2];

/** What beats t */
export function counterOf(t: Throw): Throw {
  return ((t + 1) % 3) as Throw;
}

/** -1 you lose, 0 draw, 1 you win */
export function judge(you: Throw, rival: Throw): -1 | 0 | 1 {
  if (you === rival) return 0;
  return counterOf(rival) === you ? 1 : -1;
}

const EXPLOIT = 0.65;
const STREAK_CAP = 2;

export class RivalBrain {
  private freq = [0, 0, 0];
  private trans: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  private last: Throw | null = null;
  private total = 0;
  private streak = 0;
  /** Set true on the pick that was a genuine read; UI may use it for one sting line. */
  lastPickWasRead = false;
  reads = 0;

  /** Commit the rival's throw BEFORE seeing yours. */
  pick(): Throw {
    this.lastPickWasRead = false;
    if (this.streak >= STREAK_CAP || Math.random() > EXPLOIT || this.total < 2) {
      return THROWS[Math.floor(Math.random() * 3)];
    }
    const alpha = 1;
    const freqP = this.freq.map((c) => (c + alpha) / (this.total + 3 * alpha));
    let probs = freqP;
    if (this.last !== null) {
      const row = this.trans[this.last];
      const rowTotal = row.reduce((s, c) => s + c, 0);
      if (rowTotal >= 2) {
        const transP = row.map((c) => (c + alpha) / (rowTotal + 3 * alpha));
        const w = rowTotal / (rowTotal + 2);
        probs = freqP.map((f, i) => (1 - w) * f + w * transP[i]);
      }
    }
    let top: Throw = 0;
    if (probs[1] > probs[top]) top = 1;
    if (probs[2] > probs[top]) top = 2;
    this.lastPickWasRead = true;
    return counterOf(top);
  }

  /** Report what you actually threw and whether the rival's read landed. */
  observe(you: Throw, rivalWon: boolean): void {
    this.freq[you]++;
    if (this.last !== null) this.trans[this.last][you]++;
    this.last = you;
    this.total++;
    if (this.lastPickWasRead && rivalWon) {
      this.streak++;
      this.reads++;
    } else {
      this.streak = 0;
    }
  }

  /** Your most-repeated habit, if it's real — for one line, once, at the end. */
  habitLine(): string | null {
    if (this.total < 6) return null;
    const names = ['stone', 'paper', 'scissors'];
    let best: { a: number; b: number; c: number } | null = null;
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const c = this.trans[a][b];
        if (c >= 3 && (!best || c > best.c)) best = { a, b, c };
      }
    }
    if (best) return `After ${names[best.a]} you throw ${names[best.b]}. Every time.`;
    const fav = this.freq.indexOf(Math.max(...this.freq));
    if (this.freq[fav] >= Math.ceil(this.total * 0.55)) return `That's a lot of ${names[fav]}.`;
    return null;
  }
}
