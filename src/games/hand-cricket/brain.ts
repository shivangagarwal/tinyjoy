/**
 * The Hand Cricket AI — a tiny, honest pattern-reader.
 *
 * It never sees the player's current tap. Every ball it commits to a number
 * *before* the player picks, using only two things it remembers about them:
 *   - how often they play each number (frequency), and
 *   - what they tend to play after each number (a 6×6 transition table).
 * Difficulty is simply how often it trusts that prediction instead of picking
 * at random. A streak cap forces a random pick after a few correct reads so
 * a hot streak never feels rigged.
 *
 * Everything here is deterministic given an RNG, so the daily match can seed
 * one "brain" that every player faces.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Role = 'bat' | 'bowl';

export const DIFFICULTIES: Record<
  Difficulty,
  { label: string; emoji: string; exploit: number; blurb: string }
> = {
  easy: { label: 'Rookie', emoji: '🙂', exploit: 0.2, blurb: 'Mostly guesses. Reads you 2 balls in 10.' },
  medium: { label: 'Street Smart', emoji: '😏', exploit: 0.5, blurb: 'Half guessing, half reading you.' },
  hard: { label: 'Mind Reader', emoji: '🧠', exploit: 0.8, blurb: 'Predicts your next move 8 balls in 10.' },
};

/** After this many correct predictions in a row, the next pick is forced random. */
export const MAX_PREDICTION_STREAK = 3;

export const NUMBERS = [1, 2, 3, 4, 5, 6] as const;

// ── Seeded RNG ─────────────────────────────────────────────────────────────

export type Rng = () => number;

/** mulberry32 — small, fast, good enough for a game. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

// ── Player model ───────────────────────────────────────────────────────────

export type Basis = 'transition' | 'frequency' | 'none';

export interface Prediction {
  /** Most likely next number */
  top: number;
  /** Probability assigned to `top` (0..1) */
  confidence: number;
  /** What the prediction leaned on */
  basis: Basis;
  /** Full distribution, index 0 = number 1 */
  probs: number[];
  /** Number the player played last (transition context), if any */
  last: number | null;
  /** Times the player followed `last` with `top` */
  transCount: number;
  /** Times the player has played `top` overall */
  freqCount: number;
  /** Balls observed for this role when the prediction was made */
  seen: number;
}

/** Remembers one role's picks (the player as batter, or as bowler). */
export class PlayerModel {
  freq: number[] = [0, 0, 0, 0, 0, 0];
  trans: number[][] = Array.from({ length: 6 }, () => [0, 0, 0, 0, 0, 0]);
  last: number | null = null;
  total = 0;
  history: number[] = [];

  record(n: number): void {
    this.freq[n - 1]++;
    if (this.last !== null) this.trans[this.last - 1][n - 1]++;
    this.last = n;
    this.total++;
    this.history.push(n);
  }

  /** Current run of the same number at the end of history (e.g. 4,4,4 → 3). */
  currentRun(): { n: number; len: number } | null {
    if (this.history.length === 0) return null;
    const n = this.history[this.history.length - 1];
    let len = 0;
    for (let i = this.history.length - 1; i >= 0 && this.history[i] === n; i--) len++;
    return { n, len };
  }

  favourite(): { n: number; count: number } | null {
    if (this.total === 0) return null;
    let best = 0;
    for (let i = 1; i < 6; i++) if (this.freq[i] > this.freq[best]) best = i;
    return { n: best + 1, count: this.freq[best] };
  }

  /** Strongest "after X you play Y" habit, if seen at least twice. */
  strongestHabit(): { after: number; then: number; count: number } | null {
    let best: { after: number; then: number; count: number } | null = null;
    for (let a = 0; a < 6; a++) {
      for (let b = 0; b < 6; b++) {
        const c = this.trans[a][b];
        if (c >= 2 && (!best || c > best.count)) best = { after: a + 1, then: b + 1, count: c };
      }
    }
    return best;
  }

  /**
   * Predict the next pick. Blends the transition row for the last pick with the
   * overall frequency, both Laplace-smoothed; trusts transitions more as that
   * row accumulates data. Ties broken by `rng` so cold starts are truly random.
   */
  predict(rng: Rng): Prediction {
    const alpha = 1;
    const freqProbs = this.freq.map((c) => (c + alpha) / (this.total + 6 * alpha));

    let transProbs: number[] | null = null;
    let rowTotal = 0;
    if (this.last !== null) {
      const row = this.trans[this.last - 1];
      rowTotal = row.reduce((s, c) => s + c, 0);
      transProbs = row.map((c) => (c + alpha) / (rowTotal + 6 * alpha));
    }

    const wT = transProbs ? rowTotal / (rowTotal + 2) : 0;
    const probs = freqProbs.map((f, i) => (1 - wT) * f + wT * (transProbs ? transProbs[i] : 0));

    // argmax with random tie-break (within a tiny epsilon)
    const max = Math.max(...probs);
    const ties = probs.map((p, i) => (max - p < 1e-9 ? i : -1)).filter((i) => i >= 0);
    const topIdx = ties[Math.floor(rng() * ties.length)];
    const top = topIdx + 1;

    const transCount = this.last !== null ? this.trans[this.last - 1][topIdx] : 0;
    const freqCount = this.freq[topIdx];

    // 'none' = no signal at all (a uniform tie-break). Otherwise the pick was
    // driven by data — even one observation counts, and we say so honestly.
    const uniform = max - Math.min(...probs) < 1e-9;
    let basis: Basis = 'none';
    if (!uniform) {
      const transDrove =
        this.last !== null && transProbs !== null && transCount >= 2 && transProbs[topIdx] >= freqProbs[topIdx];
      basis = transDrove ? 'transition' : 'frequency';
    }

    return { top, confidence: probs[topIdx], basis, probs, last: this.last, transCount, freqCount, seen: this.total };
  }
}

// ── The brain ──────────────────────────────────────────────────────────────

export type DecisionMode = 'predict' | 'random' | 'forced-random';

export interface Decision {
  /** The number the AI commits to for this ball */
  pick: number;
  mode: DecisionMode;
  /** The AI's prediction of the player's pick (null when it didn't predict) */
  prediction: Prediction | null;
}

export interface BallRecord {
  role: Role; // the PLAYER's role on this ball
  playerPick: number;
  aiPick: number;
  mode: DecisionMode;
  predicted: number | null;
  /** True when the AI predicted and the player played exactly that number */
  hit: boolean;
  basis: Basis;
  /** Observations backing the prediction (transition count or frequency count) */
  evidence: number;
  /** Balls the AI had seen for this role at prediction time */
  seen: number;
  /** The player's previous pick, when a transition drove the prediction */
  context: number | null;
}

export class CricketBrain {
  readonly difficulty: Difficulty;
  readonly exploit: number;
  /** Player's picks while batting (AI bowls against this) */
  readonly bat = new PlayerModel();
  /** Player's picks while bowling (AI bats against this) */
  readonly bowl = new PlayerModel();
  /** Consecutive correct predictions — capped by MAX_PREDICTION_STREAK */
  streak = 0;
  log: BallRecord[] = [];
  private rng: Rng;

  constructor(difficulty: Difficulty, rng: Rng) {
    this.difficulty = difficulty;
    this.exploit = DIFFICULTIES[difficulty].exploit;
    this.rng = rng;
  }

  private shouldPredict(): DecisionMode {
    if (this.streak >= MAX_PREDICTION_STREAK) return 'forced-random';
    return this.rng() < this.exploit ? 'predict' : 'random';
  }

  /** AI is bowling: try to match what the player will bat. */
  chooseBowl(): Decision {
    const mode = this.shouldPredict();
    if (mode !== 'predict') return { pick: rngInt(this.rng, 1, 6), mode, prediction: null };
    const prediction = this.bat.predict(this.rng);
    return { pick: prediction.top, mode, prediction };
  }

  /** AI is batting: dodge the predicted bowl, leaning towards big numbers. */
  chooseBat(): Decision {
    const mode = this.shouldPredict();
    if (mode !== 'predict') return { pick: rngInt(this.rng, 1, 6), mode, prediction: null };
    const prediction = this.bowl.predict(this.rng);
    const allowed = NUMBERS.filter((n) => n !== prediction.top);
    // weight ∝ number → 6 is six times likelier than 1
    const total = allowed.reduce((s, n) => s + n, 0);
    let r = this.rng() * total;
    let pick = allowed[allowed.length - 1];
    for (const n of allowed) {
      r -= n;
      if (r < 0) {
        pick = n;
        break;
      }
    }
    return { pick, mode, prediction };
  }

  /** Call after each ball with the player's actual pick. */
  observe(role: Role, playerPick: number, decision: Decision): BallRecord {
    const model = role === 'bat' ? this.bat : this.bowl;
    const hit = decision.mode === 'predict' && decision.prediction?.top === playerPick;
    const p = decision.prediction;
    const record: BallRecord = {
      role,
      playerPick,
      aiPick: decision.pick,
      mode: decision.mode,
      predicted: p?.top ?? null,
      hit,
      basis: p?.basis ?? 'none',
      evidence: p ? (p.basis === 'transition' ? p.transCount : p.freqCount) : 0,
      seen: p?.seen ?? 0,
      context: p?.basis === 'transition' ? p.last : null,
    };
    model.record(playerPick);
    this.streak = hit ? this.streak + 1 : 0;
    this.log.push(record);
    return record;
  }
}

// ── Insights for the "How the AI read you" card ────────────────────────────

export interface Insight {
  /** Player's batting pick counts, index 0 = number 1 */
  batCounts: number[];
  batTotal: number;
  favourite: { n: number; count: number } | null;
  habit: { after: number; then: number; count: number } | null;
  /** How the wicket ball happened, in kid words */
  wicketStory: string;
  /** Read rate: predicted balls that landed, over predicted balls */
  reads: { hits: number; attempts: number };
}

export function buildInsight(brain: CricketBrain, wicket: BallRecord | null): Insight {
  const favourite = brain.bat.favourite();
  const habit = brain.bat.strongestHabit();
  const predicted = brain.log.filter((b) => b.mode === 'predict');
  const reads = { hits: predicted.filter((b) => b.hit).length, attempts: predicted.length };

  let wicketStory: string;
  const n = wicket?.playerPick;
  if (!wicket) {
    wicketStory = 'You were never out — the AI never caught your pattern.';
  } else if (wicket.hit && wicket.basis === 'transition') {
    wicketStory = `After a ${wicket.context}, you'd played ${n} ${wicket.evidence} times. The AI spotted the habit and bowled ${n}.`;
  } else if (wicket.hit && wicket.basis === 'frequency' && wicket.evidence <= 1) {
    wicketStory = `You'd played ${n} only once — but the AI bet you'd repeat it. It did. AI jumps to conclusions fast!`;
  } else if (wicket.hit && wicket.basis === 'frequency') {
    wicketStory = `${n} was your go-to — ${wicket.evidence} of your ${wicket.seen} balls — so the AI bowled it. Out.`;
  } else if (wicket.hit) {
    wicketStory = `The AI had nothing on you yet — its first pick was a pure guess, and it landed.`;
  } else {
    wicketStory = `Not a prediction — the AI was guessing randomly this ball, and ${wicket.aiPick} happened to match.`;
  }

  return {
    batCounts: [...brain.bat.freq],
    batTotal: brain.bat.total,
    favourite,
    habit,
    wicketStory,
    reads,
  };
}
