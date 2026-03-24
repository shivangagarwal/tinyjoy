'use client';

import { useCallback, useEffect, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Types ──────────────────────────────────────────────────────────────────

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string;
}

interface Selection {
  pile: 'stock' | 'waste' | 'tableau' | 'foundation';
  pileIndex: number;
  cardIndex: number;
}

type GamePhase = 'menu' | 'playing' | 'won';

// ── Constants ──────────────────────────────────────────────────────────────

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES: Record<Rank, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13,
};

const RED_SUITS: Set<Suit> = new Set(['♥', '♦']);

// ── Helpers ────────────────────────────────────────────────────────────────

function isRed(suit: Suit) { return RED_SUITS.has(suit); }

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false, id: `${rank}${suit}` });
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function canStackOnTableau(card: Card, target: Card | null): boolean {
  if (!target) return card.rank === 'K';
  return (
    isRed(card.suit) !== isRed(target.suit) &&
    RANK_VALUES[card.rank] === RANK_VALUES[target.rank] - 1
  );
}

function canStackOnFoundation(card: Card, topCard: Card | null, suit: Suit | null): boolean {
  if (!topCard) return card.rank === 'A';
  return card.suit === suit && RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] + 1;
}

interface GameState {
  stock: Card[];
  waste: Card[];
  tableau: Card[][];
  foundation: (Card | null)[];  // top card of each foundation pile
  foundationPiles: Card[][];    // full foundation piles
}

function deal(): GameState {
  const deck = shuffle(createDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  let idx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[idx++], faceUp: row === col };
      tableau[col].push(card);
    }
  }
  const stock = deck.slice(idx).map((c) => ({ ...c, faceUp: false }));
  return {
    stock,
    waste: [],
    tableau,
    foundation: [null, null, null, null],
    foundationPiles: [[], [], [], []],
  };
}

// ── Card Component ─────────────────────────────────────────────────────────

function CardFace({ card, selected, small }: { card: Card; selected?: boolean; small?: boolean }) {
  const red = isRed(card.suit);
  return (
    <div
      className={`flex flex-col justify-between rounded-md border font-bold select-none
        ${small ? 'h-16 w-11 text-xs p-0.5' : 'h-20 w-14 text-sm p-1'}
        ${red ? 'text-red-500' : 'text-white'}
        ${selected ? 'border-yellow-400 bg-zinc-700' : 'border-zinc-600 bg-zinc-800'}
      `}
    >
      <span>{card.rank}{card.suit}</span>
      <span className="self-end rotate-180">{card.rank}{card.suit}</span>
    </div>
  );
}

function CardBack({ small }: { small?: boolean }) {
  return (
    <div
      className={`rounded-md border border-zinc-600 bg-indigo-900 select-none
        ${small ? 'h-16 w-11' : 'h-20 w-14'}
      `}
    />
  );
}

function EmptySlot({ small, label }: { small?: boolean; label?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border-2 border-dashed border-zinc-700 text-zinc-600 select-none
        ${small ? 'h-16 w-11 text-xs' : 'h-20 w-14 text-lg'}
      `}
    >
      {label}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function SolitaireGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [game, setGame] = useState<GameState | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [gamesWon, setGamesWon] = useState(0);

  useEffect(() => {
    try {
      const b = localStorage.getItem('tinyjoy:solitaire-best');
      if (b) setBestMoves(Number(b));
      const w = localStorage.getItem('tinyjoy:solitaire-wins');
      if (w) setGamesWon(Number(w));
    } catch { /* ignore */ }
  }, []);

  const startGame = useCallback(() => {
    setGame(deal());
    setSelection(null);
    setMoves(0);
    setPhase('playing');
  }, []);

  const checkWin = useCallback((g: GameState): boolean => {
    return g.foundationPiles.every((fp) => fp.length === 13);
  }, []);

  const drawFromStock = useCallback(() => {
    if (!game) return;
    setSelection(null);
    const newGame = { ...game, stock: [...game.stock], waste: [...game.waste] };
    if (newGame.stock.length === 0) {
      // Flip waste back to stock
      newGame.stock = newGame.waste.reverse().map((c) => ({ ...c, faceUp: false }));
      newGame.waste = [];
    } else {
      const card = { ...newGame.stock.pop()!, faceUp: true };
      newGame.waste.push(card);
    }
    setGame(newGame);
    setMoves((m) => m + 1);
  }, [game]);

  const tryAutoComplete = useCallback((g: GameState): GameState => {
    // Auto-move face-up cards to foundations when possible
    let changed = true;
    let current = g;
    while (changed) {
      changed = false;
      outer: for (let ti = 0; ti < 7; ti++) {
        const col = current.tableau[ti];
        if (col.length === 0) continue;
        const card = col[col.length - 1];
        if (!card.faceUp) continue;
        for (let fi = 0; fi < 4; fi++) {
          const topCard = current.foundationPiles[fi].length > 0
            ? current.foundationPiles[fi][current.foundationPiles[fi].length - 1]
            : null;
          const suit = current.foundationPiles[fi].length > 0
            ? current.foundationPiles[fi][0].suit
            : null;
          if (canStackOnFoundation(card, topCard, suit)) {
            const newTableau = current.tableau.map((c, i) => i === ti ? c.slice(0, -1) : [...c]);
            if (newTableau[ti].length > 0) {
              newTableau[ti][newTableau[ti].length - 1] = { ...newTableau[ti][newTableau[ti].length - 1], faceUp: true };
            }
            const newFoundationPiles = current.foundationPiles.map((fp, i) => i === fi ? [...fp, card] : [...fp]);
            const newFoundation = newFoundationPiles.map((fp) => fp.length > 0 ? fp[fp.length - 1] : null);
            current = { ...current, tableau: newTableau, foundation: newFoundation, foundationPiles: newFoundationPiles };
            changed = true;
            break outer;
          }
        }
      }
    }
    return current;
  }, []);

  const handleCardClick = useCallback((
    pile: Selection['pile'],
    pileIndex: number,
    cardIndex: number,
  ) => {
    if (!game) return;

    // If clicking stock, draw
    if (pile === 'stock') {
      drawFromStock();
      return;
    }

    // Get the card being clicked
    let clickedCard: Card | null = null;
    if (pile === 'waste' && game.waste.length > 0) {
      clickedCard = game.waste[game.waste.length - 1];
    } else if (pile === 'tableau') {
      clickedCard = game.tableau[pileIndex][cardIndex] ?? null;
    } else if (pile === 'foundation') {
      clickedCard = game.foundationPiles[pileIndex][game.foundationPiles[pileIndex].length - 1] ?? null;
    }

    if (!clickedCard?.faceUp) {
      // Flip face-down tableau card
      if (pile === 'tableau') {
        const col = game.tableau[pileIndex];
        if (cardIndex === col.length - 1 && !col[cardIndex].faceUp) {
          const newTableau = game.tableau.map((c, i) =>
            i === pileIndex
              ? c.map((card, j) => j === cardIndex ? { ...card, faceUp: true } : card)
              : [...c]
          );
          setGame({ ...game, tableau: newTableau });
          setMoves((m) => m + 1);
        }
      }
      setSelection(null);
      return;
    }

    // If we have a selection, try to move
    if (selection) {
      // Don't re-select same card
      if (selection.pile === pile && selection.pileIndex === pileIndex && selection.cardIndex === cardIndex) {
        setSelection(null);
        return;
      }

      // Try to execute move
      const newGame = { ...game };
      let moved = false;

      // Get cards to move
      let cardsToMove: Card[] = [];
      if (selection.pile === 'waste') {
        cardsToMove = [game.waste[game.waste.length - 1]];
      } else if (selection.pile === 'tableau') {
        cardsToMove = game.tableau[selection.pileIndex].slice(selection.cardIndex);
      } else if (selection.pile === 'foundation') {
        cardsToMove = [game.foundationPiles[selection.pileIndex][game.foundationPiles[selection.pileIndex].length - 1]];
      }

      if (cardsToMove.length === 0) {
        setSelection(null);
        return;
      }

      const topCard = cardsToMove[0];

      if (pile === 'tableau') {
        const targetCol = game.tableau[pileIndex];
        const targetTop = targetCol.length > 0 ? targetCol[targetCol.length - 1] : null;
        if (canStackOnTableau(topCard, targetTop)) {
          // Remove from source
          const newTableau = game.tableau.map((c) => [...c]);
          if (selection.pile === 'waste') {
            newGame.waste = game.waste.slice(0, -1);
          } else if (selection.pile === 'tableau') {
            newTableau[selection.pileIndex] = game.tableau[selection.pileIndex].slice(0, selection.cardIndex);
            // Flip newly exposed card
            const srcCol = newTableau[selection.pileIndex];
            if (srcCol.length > 0 && !srcCol[srcCol.length - 1].faceUp) {
              srcCol[srcCol.length - 1] = { ...srcCol[srcCol.length - 1], faceUp: true };
            }
          }
          // Add to destination
          newTableau[pileIndex] = [...game.tableau[pileIndex], ...cardsToMove];
          newGame.tableau = newTableau;
          moved = true;
        }
      } else if (pile === 'foundation' && cardsToMove.length === 1) {
        const fp = game.foundationPiles[pileIndex];
        const topFoundation = fp.length > 0 ? fp[fp.length - 1] : null;
        const suit = fp.length > 0 ? fp[0].suit : null;
        if (canStackOnFoundation(topCard, topFoundation, suit)) {
          const newFoundationPiles = game.foundationPiles.map((fpile, i) =>
            i === pileIndex ? [...fpile, topCard] : [...fpile]
          );
          if (selection.pile === 'waste') {
            newGame.waste = game.waste.slice(0, -1);
          } else if (selection.pile === 'tableau') {
            const newTableau = game.tableau.map((c) => [...c]);
            newTableau[selection.pileIndex] = game.tableau[selection.pileIndex].slice(0, selection.cardIndex);
            const srcCol = newTableau[selection.pileIndex];
            if (srcCol.length > 0 && !srcCol[srcCol.length - 1].faceUp) {
              srcCol[srcCol.length - 1] = { ...srcCol[srcCol.length - 1], faceUp: true };
            }
            newGame.tableau = newTableau;
          }
          newGame.foundationPiles = newFoundationPiles;
          newGame.foundation = newFoundationPiles.map((fp) => fp.length > 0 ? fp[fp.length - 1] : null);
          moved = true;
        }
      }

      if (moved) {
        const autoCompleted = tryAutoComplete(newGame);
        const isWon = checkWin(autoCompleted);
        if (isWon) {
          const newWins = gamesWon + 1;
          setGamesWon(newWins);
          setBestMoves((prev) => {
            const next = prev === null ? moves + 1 : Math.min(prev, moves + 1);
            try { localStorage.setItem('tinyjoy:solitaire-best', String(next)); } catch { /* ignore */ }
            return next;
          });
          try { localStorage.setItem('tinyjoy:solitaire-wins', String(newWins)); } catch { /* ignore */ }
          setGame(autoCompleted);
          setMoves((m) => m + 1);
          setSelection(null);
          setTimeout(() => setPhase('won'), 300);
        } else {
          setGame(autoCompleted);
          setMoves((m) => m + 1);
          setSelection(null);
        }
        return;
      }

      // Couldn't move — re-select if clicking a face-up card in tableau
      if (pile === 'tableau' && clickedCard?.faceUp) {
        setSelection({ pile, pileIndex, cardIndex });
      } else {
        setSelection(null);
      }
      return;
    }

    // No existing selection — create one
    if (pile === 'waste' || pile === 'tableau' || pile === 'foundation') {
      if (clickedCard) {
        setSelection({ pile, pileIndex, cardIndex });
      }
    }
  }, [game, selection, drawFromStock, tryAutoComplete, checkWin, moves, gamesWon]);

  // ── Render: Menu ───────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4"><HomeLink /></div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-6xl">🃏</span>
              <h1 className="text-4xl font-bold tracking-tight">Solitaire</h1>
              <p className="text-center text-zinc-400">
                Classic Klondike solitaire. Tap to select, tap to move. Build foundations from Ace to King.
              </p>
            </div>
            {gamesWon > 0 && (
              <p className="text-zinc-500">
                Wins: <span className="font-bold text-white">{gamesWon}</span>
                {bestMoves !== null && (
                  <span> · Best: <span className="font-bold text-white">{bestMoves} moves</span></span>
                )}
              </p>
            )}
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

  // ── Render: Won ────────────────────────────────────────────────────────

  if (phase === 'won') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4"><HomeLink /></div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-6xl">🎉</span>
              <h2 className="text-3xl font-bold">You Won!</h2>
              <p className="text-zinc-400">
                Completed in <span className="font-bold text-white">{moves}</span> moves
              </p>
              <p className="text-zinc-400">
                Total wins: <span className="text-2xl font-bold text-white">{gamesWon}</span>
              </p>
              {bestMoves !== null && (
                <p className="text-sm text-zinc-500">
                  Best: <span className="font-semibold text-white">{bestMoves} moves</span>
                </p>
              )}
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              <button
                onClick={startGame}
                className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
              >
                Play again
              </button>
              <ShareButton score={gamesWon} gameName="Solitaire" gameSlug="solitaire" />
            </div>
            <OtherGames currentHref="/games/solitaire" />
          </div>
        </div>
      </div>
    );
  }

  if (!game) return null;

  // ── Render: Playing ───────────────────────────────────────────────────

  const wasteTop = game.waste.length > 0 ? game.waste[game.waste.length - 1] : null;
  const isWasteSelected = selection?.pile === 'waste';

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <HomeLink />
        <span className="text-sm text-zinc-400">
          Moves: <span className="font-bold text-white">{moves}</span>
        </span>
        <button
          onClick={startGame}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700"
        >
          New
        </button>
      </div>

      {/* Top row: Stock, Waste, Foundation */}
      <div className="flex items-start justify-between px-3 pb-3">
        {/* Stock */}
        <div
          className="cursor-pointer active:scale-95 transition"
          onClick={() => handleCardClick('stock', 0, 0)}
        >
          {game.stock.length > 0 ? (
            <CardBack small />
          ) : (
            <EmptySlot small label="↺" />
          )}
        </div>

        {/* Waste */}
        <div
          className="cursor-pointer active:scale-95 transition"
          onClick={() => wasteTop && handleCardClick('waste', 0, 0)}
        >
          {wasteTop ? (
            <CardFace card={wasteTop} selected={isWasteSelected} small />
          ) : (
            <EmptySlot small />
          )}
        </div>

        {/* Spacer */}
        <div className="w-11" />

        {/* Foundation piles */}
        {game.foundationPiles.map((fp, fi) => {
          const top = fp.length > 0 ? fp[fp.length - 1] : null;
          const isSelected = selection?.pile === 'foundation' && selection.pileIndex === fi;
          return (
            <div
              key={fi}
              className="cursor-pointer active:scale-95 transition"
              onClick={() => handleCardClick('foundation', fi, fp.length - 1)}
            >
              {top ? (
                <CardFace card={top} selected={isSelected} small />
              ) : (
                <EmptySlot small label="A" />
              )}
            </div>
          );
        })}
      </div>

      {/* Tableau */}
      <div className="flex flex-1 gap-1 px-1 overflow-x-auto">
        {game.tableau.map((col, ci) => {
          return (
            <div key={ci} className="flex flex-1 flex-col items-center">
              {/* Empty column slot */}
              {col.length === 0 && (
                <div
                  className="cursor-pointer"
                  onClick={() => handleCardClick('tableau', ci, 0)}
                >
                  <EmptySlot small label="K" />
                </div>
              )}
              {col.map((card, ri) => {
                const isSelected = selection?.pile === 'tableau' && selection.pileIndex === ci && selection.cardIndex === ri;
                const isInSelection = selection?.pile === 'tableau' && selection.pileIndex === ci && ri >= (selection.cardIndex ?? 0);

                const offsetTop = ri === 0 ? 0 : ri * 18;

                return (
                  <div
                    key={card.id}
                    style={{ marginTop: ri === 0 ? 0 : -62 + 18, zIndex: ri }}
                    className="cursor-pointer active:scale-95 transition"
                    onClick={() => handleCardClick('tableau', ci, ri)}
                  >
                    {card.faceUp ? (
                      <CardFace card={card} selected={isInSelection} small />
                    ) : (
                      <CardBack small />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {selection && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
          Tap destination to move · Tap again to deselect
        </div>
      )}
    </div>
  );
}
