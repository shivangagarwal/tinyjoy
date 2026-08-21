/**
 * Dots & Boxes board + rival brain. Pure functions over a small mutable
 * board so the AI can simulate cheaply.
 *
 * The rival: takes every completion it's owed, otherwise plays edges that
 * don't hand you a third side, and when only gifts remain it simulates each
 * candidate and opens the cheapest chain.
 */

export type Owner = 0 | 1 | 2; // none | you | rival
export const YOU: Owner = 1;
export const RIVAL: Owner = 2;

export interface Edge {
  t: 'h' | 'v';
  r: number;
  c: number;
}

export interface Board {
  rows: number;
  cols: number;
  /** horizontal edges, (rows+1) x cols */
  h: Owner[];
  /** vertical edges, rows x (cols+1) */
  v: Owner[];
  /** box owners, rows x cols */
  owner: Owner[];
}

export function createBoard(rows: number, cols: number): Board {
  return {
    rows,
    cols,
    h: Array((rows + 1) * cols).fill(0),
    v: Array(rows * (cols + 1)).fill(0),
    owner: Array(rows * cols).fill(0),
  };
}

export function cloneBoard(b: Board): Board {
  return { rows: b.rows, cols: b.cols, h: [...b.h], v: [...b.v], owner: [...b.owner] };
}

function hIdx(b: Board, r: number, c: number): number {
  return r * b.cols + c;
}
function vIdx(b: Board, r: number, c: number): number {
  return r * (b.cols + 1) + c;
}

export function isPlaced(b: Board, e: Edge): boolean {
  return e.t === 'h' ? b.h[hIdx(b, e.r, e.c)] !== 0 : b.v[vIdx(b, e.r, e.c)] !== 0;
}

export function allEdges(b: Board): Edge[] {
  const out: Edge[] = [];
  for (let r = 0; r <= b.rows; r++) for (let c = 0; c < b.cols; c++) out.push({ t: 'h', r, c });
  for (let r = 0; r < b.rows; r++) for (let c = 0; c <= b.cols; c++) out.push({ t: 'v', r, c });
  return out;
}

export function openEdges(b: Board): Edge[] {
  return allEdges(b).filter((e) => !isPlaced(b, e));
}

/** Boxes adjacent to an edge (1 or 2). */
export function boxesOf(b: Board, e: Edge): { r: number; c: number }[] {
  const out: { r: number; c: number }[] = [];
  if (e.t === 'h') {
    if (e.r > 0) out.push({ r: e.r - 1, c: e.c });
    if (e.r < b.rows) out.push({ r: e.r, c: e.c });
  } else {
    if (e.c > 0) out.push({ r: e.r, c: e.c - 1 });
    if (e.c < b.cols) out.push({ r: e.r, c: e.c });
  }
  return out;
}

export function sides(b: Board, r: number, c: number): number {
  return (
    (b.h[hIdx(b, r, c)] ? 1 : 0) +
    (b.h[hIdx(b, r + 1, c)] ? 1 : 0) +
    (b.v[vIdx(b, r, c)] ? 1 : 0) +
    (b.v[vIdx(b, r, c + 1)] ? 1 : 0)
  );
}

/** Place an edge; claims any completed boxes for `who`. Mutates. */
export function place(b: Board, e: Edge, who: Owner): { r: number; c: number }[] {
  if (e.t === 'h') b.h[hIdx(b, e.r, e.c)] = who;
  else b.v[vIdx(b, e.r, e.c)] = who;
  const completed: { r: number; c: number }[] = [];
  for (const box of boxesOf(b, e)) {
    if (b.owner[box.r * b.cols + box.c] === 0 && sides(b, box.r, box.c) === 4) {
      b.owner[box.r * b.cols + box.c] = who;
      completed.push(box);
    }
  }
  return completed;
}

export function scores(b: Board): { you: number; rival: number } {
  let you = 0;
  let rival = 0;
  for (const o of b.owner) {
    if (o === YOU) you++;
    else if (o === RIVAL) rival++;
  }
  return { you, rival };
}

export function isDone(b: Board): boolean {
  return b.owner.every((o) => o !== 0);
}

/** Edges that immediately complete at least one box. */
function completions(b: Board): Edge[] {
  return openEdges(b).filter((e) => boxesOf(b, e).some((box) => b.owner[box.r * b.cols + box.c] === 0 && sides(b, box.r, box.c) === 3));
}

/** Edges that leave every adjacent box at ≤2 sides (no gift). */
function safeEdges(b: Board): Edge[] {
  return openEdges(b).filter((e) => boxesOf(b, e).every((box) => sides(b, box.r, box.c) <= 1));
}

/** Let `who` greedily capture everything currently on offer. Mutates. Returns count. */
export function greedyCapture(b: Board, who: Owner): number {
  let captured = 0;
  for (;;) {
    const comps = completions(b);
    if (comps.length === 0) return captured;
    captured += place(b, comps[0], who).length;
  }
}

/**
 * The rival's next edge. Call repeatedly during its turn; it returns one edge
 * at a time so the UI can animate chain captures move by move.
 */
export function rivalPick(b: Board): Edge {
  const comps = completions(b);
  if (comps.length > 0) return comps[0];

  const safe = safeEdges(b);
  if (safe.length > 0) return safe[Math.floor(Math.random() * safe.length)];

  // Every edge is a gift: open the cheapest chain.
  let best: Edge | null = null;
  let bestLoss = Infinity;
  for (const e of openEdges(b)) {
    const sim = cloneBoard(b);
    place(sim, e, RIVAL);
    const loss = greedyCapture(sim, YOU);
    if (loss < bestLoss || (loss === bestLoss && Math.random() < 0.5)) {
      bestLoss = loss;
      best = e;
    }
  }
  return best!;
}
