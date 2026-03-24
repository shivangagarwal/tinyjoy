'use client';

import { useCallback, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Types ────────────────────────────────────────────────────────────────────

type Phase = 'menu' | 'playing' | 'gameover';
type Board = number[][]; // 0=empty, 1=player, 2=AI

const ROWS = 6;
const COLS = 7;

// Center-weighted column preference order
const COL_PREFERENCE = [3, 2, 4, 1, 5, 0, 6];

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function dropDisc(board: Board, col: number, player: number): Board | null {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      const next = board.map((r) => [...r]);
      next[row][col] = player;
      return next;
    }
  }
  return null; // column full
}

function getDropRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row;
  }
  return -1;
}

function checkWinner(board: Board): { winner: number; cells: [number, number][] } {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = board[r][c];
      if (val === 0) continue;

      for (const [dr, dc] of directions) {
        const cells: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (board[nr][nc] !== val) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) {
          return { winner: val, cells };
        }
      }
    }
  }
  return { winner: 0, cells: [] };
}

function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== 0);
}

function canWinInOne(board: Board, player: number): number | null {
  for (const col of COL_PREFERENCE) {
    const row = getDropRow(board, col);
    if (row === -1) continue;
    const next = board.map((r) => [...r]);
    next[row][col] = player;
    if (checkWinner(next).winner === player) return col;
  }
  return null;
}

function getAiMove(board: Board): number {
  // Win if possible
  const winMove = canWinInOne(board, 2);
  if (winMove !== null) return winMove;

  // Block player win
  const blockMove = canWinInOne(board, 1);
  if (blockMove !== null) return blockMove;

  // Pick center-weighted valid column
  for (const col of COL_PREFERENCE) {
    if (getDropRow(board, col) !== -1) return col;
  }

  return 0;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ConnectFourGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [winCells, setWinCells] = useState<[number, number][]>([]);
  const [result, setResult] = useState<'win' | 'loss' | 'draw' | null>(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const startGame = useCallback(() => {
    setBoard(emptyBoard());
    setWinCells([]);
    setResult(null);
    setIsAiThinking(false);
    setPhase('playing');
  }, []);

  const handleColClick = useCallback(
    (col: number) => {
      if (isAiThinking) return;
      if (getDropRow(board, col) === -1) return;

      const afterPlayer = dropDisc(board, col, 1);
      if (!afterPlayer) return;

      const { winner: pWin, cells: pCells } = checkWinner(afterPlayer);
      if (pWin === 1) {
        setBoard(afterPlayer);
        setWinCells(pCells);
        setResult('win');
        setWins((w) => w + 1);
        setPhase('gameover');
        return;
      }

      if (isBoardFull(afterPlayer)) {
        setBoard(afterPlayer);
        setResult('draw');
        setDraws((d) => d + 1);
        setPhase('gameover');
        return;
      }

      setIsAiThinking(true);
      setBoard(afterPlayer);

      setTimeout(() => {
        const aiCol = getAiMove(afterPlayer);
        const afterAi = dropDisc(afterPlayer, aiCol, 2);
        if (!afterAi) return;

        const { winner: aWin, cells: aCells } = checkWinner(afterAi);
        if (aWin === 2) {
          setBoard(afterAi);
          setWinCells(aCells);
          setResult('loss');
          setLosses((l) => l + 1);
          setPhase('gameover');
        } else if (isBoardFull(afterAi)) {
          setBoard(afterAi);
          setResult('draw');
          setDraws((d) => d + 1);
          setPhase('gameover');
        } else {
          setBoard(afterAi);
          setIsAiThinking(false);
        }
      }, 400);
    },
    [board, isAiThinking],
  );

  const isWinCell = (r: number, c: number) =>
    winCells.some(([wr, wc]) => wr === r && wc === c);

  const cellColor = (val: number, r: number, c: number, gameOver = false) => {
    if (val === 1) {
      return gameOver && isWinCell(r, c)
        ? 'bg-red-400 ring-2 ring-white ring-offset-1 ring-offset-zinc-900'
        : 'bg-red-500';
    }
    if (val === 2) {
      return gameOver && isWinCell(r, c)
        ? 'bg-yellow-300 ring-2 ring-white ring-offset-1 ring-offset-zinc-900'
        : 'bg-yellow-400';
    }
    return 'bg-zinc-800';
  };

  // ── Menu ───────────────────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="text-5xl">🔵</div>
              <h1 className="text-3xl font-bold">Connect Four</h1>
              <p className="text-center text-zinc-400">
                You are red. Get 4 in a row. Beat the AI.
              </p>
              {wins + losses + draws > 0 && (
                <p className="text-sm text-zinc-500">
                  <span className="text-green-400">{wins}W</span>{' '}
                  <span className="text-red-400">{losses}L</span>{' '}
                  <span className="text-zinc-400">{draws}D</span>
                </p>
              )}
            </div>
            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Game Over ──────────────────────────────────────────────────────────────

  if (phase === 'gameover') {
    const emoji = result === 'win' ? '🎉' : result === 'loss' ? '😔' : '🤝';
    const headline =
      result === 'win' ? 'You win!' : result === 'loss' ? 'AI wins' : 'Draw!';

    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="text-5xl">{emoji}</div>
              <p className="text-3xl font-bold">{headline}</p>
              <p className="text-sm text-zinc-500">
                <span className="text-green-400">{wins}W</span>{' '}
                <span className="text-red-400">{losses}L</span>{' '}
                <span className="text-zinc-400">{draws}D</span>
              </p>
            </div>

            {/* Final board */}
            <div className="rounded-2xl bg-zinc-900 p-3">
              <div className="flex flex-col gap-1">
                {board.map((row, r) => (
                  <div key={r} className="flex gap-1">
                    {row.map((val, c) => (
                      <div
                        key={c}
                        className={`h-10 w-10 rounded-full ${cellColor(val, r, c, true)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>
            <ShareButton score={wins} gameName="Connect Four" gameSlug="connect-four" />
            <OtherGames currentHref="/games/connect-four" />
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
      <div className="pt-4">
        <HomeLink />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <p className="text-sm font-medium text-zinc-400">
          {isAiThinking ? 'AI thinking…' : 'Your turn'}
        </p>

        <div className="rounded-2xl bg-zinc-900 p-3">
          {/* Column drop arrows */}
          <div className="mb-1 flex gap-1">
            {Array.from({ length: COLS }, (_, c) => (
              <button
                key={c}
                onClick={() => handleColClick(c)}
                disabled={isAiThinking || getDropRow(board, c) === -1}
                className="flex h-6 w-10 items-center justify-center text-xs text-zinc-500 transition hover:text-white disabled:opacity-20"
                aria-label={`Drop in column ${c + 1}`}
              >
                ▼
              </button>
            ))}
          </div>

          {/* Board grid */}
          <div className="flex flex-col gap-1">
            {board.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((val, c) => (
                  <button
                    key={c}
                    onClick={() => handleColClick(c)}
                    disabled={isAiThinking || getDropRow(board, c) === -1}
                    className={`h-10 w-10 rounded-full transition active:scale-95 ${cellColor(val, r, c)} ${
                      val === 0 && !isAiThinking && getDropRow(board, c) !== -1
                        ? 'hover:brightness-125'
                        : ''
                    }`}
                    aria-label={`Column ${c + 1}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          <span className="text-green-400">{wins}W</span>{' '}
          <span className="text-red-400">{losses}L</span>{' '}
          <span className="text-zinc-500">{draws}D</span>
        </p>
      </div>
    </div>
  );
}
