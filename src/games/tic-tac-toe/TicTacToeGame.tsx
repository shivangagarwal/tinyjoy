'use client';

import { useCallback, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Types ────────────────────────────────────────────────────────────────────

type Cell = 'X' | 'O' | null;
type Board = Cell[];
type Phase = 'menu' | 'playing' | 'gameover';

// ── Helpers ──────────────────────────────────────────────────────────────────

const WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diags
];

function checkWinner(board: Board): { winner: Cell; line: number[] | null } {
  for (const line of WINS) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function isFull(board: Board): boolean {
  return board.every((c) => c !== null);
}

// Minimax AI
function minimax(board: Board, isMaximizing: boolean): number {
  const { winner } = checkWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (isFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board: Board): number {
  let bestVal = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const val = minimax(board, false);
      board[i] = null;
      if (val > bestVal) {
        bestVal = val;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function emptyBoard(): Board {
  return Array(9).fill(null);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TicTacToeGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [result, setResult] = useState<'win' | 'loss' | 'draw' | null>(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const startGame = useCallback(() => {
    setBoard(emptyBoard());
    setWinLine(null);
    setResult(null);
    setIsAiThinking(false);
    setPhase('playing');
  }, []);

  const handleClick = useCallback(
    (idx: number) => {
      if (isAiThinking || board[idx]) return;

      const newBoard = [...board] as Board;
      newBoard[idx] = 'X';

      const { winner: xWin, line: xLine } = checkWinner(newBoard);
      if (xWin) {
        setBoard(newBoard);
        setWinLine(xLine);
        setResult('win');
        setWins((w) => w + 1);
        setPhase('gameover');
        return;
      }

      if (isFull(newBoard)) {
        setBoard(newBoard);
        setResult('draw');
        setDraws((d) => d + 1);
        setPhase('gameover');
        return;
      }

      setIsAiThinking(true);
      setBoard(newBoard);

      // Small delay so AI move feels natural
      setTimeout(() => {
        const aiMove = getBestMove([...newBoard] as Board);
        const afterAi = [...newBoard] as Board;
        afterAi[aiMove] = 'O';

        const { winner: oWin, line: oLine } = checkWinner(afterAi);
        if (oWin) {
          setBoard(afterAi);
          setWinLine(oLine);
          setResult('loss');
          setLosses((l) => l + 1);
          setPhase('gameover');
        } else if (isFull(afterAi)) {
          setBoard(afterAi);
          setResult('draw');
          setDraws((d) => d + 1);
          setPhase('gameover');
        } else {
          setBoard(afterAi);
          setIsAiThinking(false);
        }
      }, 300);
    },
    [board, isAiThinking],
  );

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
              <div className="text-5xl">⭕</div>
              <h1 className="text-3xl font-bold">Tic-Tac-Toe</h1>
              <p className="text-center text-zinc-400">
                You are X. Beat the AI. Classic 3×3.
              </p>
              {(wins + losses + draws) > 0 && (
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
    const headline = result === 'win' ? 'You won!' : result === 'loss' ? 'AI wins' : 'Draw!';
    const shareScore = result === 'win' ? wins : 0;

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
            <div className="grid grid-cols-3 gap-2">
              {board.map((cell, i) => {
                const isWin = winLine?.includes(i);
                return (
                  <div
                    key={i}
                    className={`flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-bold ${
                      isWin
                        ? 'bg-yellow-400 text-zinc-900'
                        : 'bg-zinc-800 text-white'
                    }`}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>
            <ShareButton score={shareScore} gameName="Tic-Tac-Toe" gameSlug="tic-tac-toe" />
            <OtherGames currentHref="/games/tic-tac-toe" />
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
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <p className="text-sm font-medium text-zinc-400">
          {isAiThinking ? 'AI is thinking…' : 'Your turn (X)'}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!cell || isAiThinking}
              className={`flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-bold transition select-none
                ${cell === 'X' ? 'bg-blue-600 text-white' : ''}
                ${cell === 'O' ? 'bg-rose-600 text-white' : ''}
                ${!cell ? 'bg-zinc-800 hover:bg-zinc-700 active:scale-95' : ''}
              `}
            >
              {cell}
            </button>
          ))}
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
