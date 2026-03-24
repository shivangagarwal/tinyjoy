export type GameCategory = 'quick' | 'word' | 'arcade' | 'puzzle' | 'classic';

export interface Game {
  href: string;
  name: string;
  description: string;
  emoji: string;
  bg: string;
  category: GameCategory;
  featured?: true;
}

export const GAMES: Game[] = [
  {
    href: '/games/color-match',
    name: 'Color Match',
    description: 'Tap matching tiles. 60 seconds.',
    emoji: '🎨',
    bg: '#3B82F6',
    category: 'quick',
    featured: true,
  },
  {
    href: '/games/memory-flip',
    name: 'Memory Flip',
    description: 'Find matching pairs. Beat the clock.',
    emoji: '🃏',
    bg: '#8B5CF6',
    category: 'quick',
  },
  {
    href: '/games/number-rush',
    name: 'Number Rush',
    description: 'Tap 1→25 in order. How fast are you?',
    emoji: '⚡',
    bg: '#10B981',
    category: 'quick',
  },
  {
    href: '/games/pattern-echo',
    name: 'Pattern Echo',
    description: 'Watch the sequence. Repeat it.',
    emoji: '🔮',
    bg: '#F59E0B',
    category: 'quick',
  },
  {
    href: '/games/word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble words. 60 seconds.',
    emoji: '🔤',
    bg: '#EC4899',
    category: 'quick',
  },
  {
    href: '/games/typing-speed',
    name: 'Typing Speed',
    description: 'Type a passage. How fast are you?',
    emoji: '⌨️',
    bg: '#06B6D4',
    category: 'quick',
  },
  {
    href: '/games/reaction-time',
    name: 'Reaction Time',
    description: 'Tap when it turns green. 5 rounds.',
    emoji: '⚡',
    bg: '#22C55E',
    category: 'quick',
  },
  {
    href: '/games/snake',
    name: 'Snake',
    description: 'Eat food. Grow longer. Classic.',
    emoji: '🐍',
    bg: '#16A34A',
    category: 'arcade',
  },
  {
    href: '/games/2048',
    name: '2048',
    description: 'Slide tiles. Merge numbers. Reach 2048.',
    emoji: '🎯',
    bg: '#F59E0B',
    category: 'puzzle',
    featured: true,
  },
  {
    href: '/games/whack-a-mole',
    name: 'Whack-a-Mole',
    description: 'Tap moles as they pop up. 30 seconds.',
    emoji: '🔨',
    bg: '#92400E',
    category: 'quick',
  },
  {
    href: '/games/tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Classic 3×3. Beat the AI.',
    emoji: '⭕',
    bg: '#6366F1',
    category: 'classic',
  },
  {
    href: '/games/sudoku',
    name: 'Sudoku',
    description: 'Fill the grid. No repeats.',
    emoji: '🔢',
    bg: '#0EA5E9',
    category: 'puzzle',
  },
  {
    href: '/games/minesweeper',
    name: 'Minesweeper',
    description: 'Find all safe squares. No booms.',
    emoji: '💣',
    bg: '#64748B',
    category: 'puzzle',
  },
  {
    href: '/games/flappy-jump',
    name: 'Flappy Jump',
    description: 'Tap to fly. Dodge the pipes.',
    emoji: '🐦',
    bg: '#F97316',
    category: 'arcade',
  },
  {
    href: '/games/hangman',
    name: 'Hangman',
    description: 'Guess the word. Letter by letter.',
    emoji: '🪢',
    bg: '#DC2626',
    category: 'word',
  },
  {
    href: '/games/connect-four',
    name: 'Connect Four',
    description: 'Drop discs. Get 4 in a row.',
    emoji: '🔵',
    bg: '#2563EB',
    category: 'classic',
  },
  {
    href: '/games/word-guess',
    name: 'Word Guess',
    description: 'Guess the 5-letter word. 6 tries.',
    emoji: '🟩',
    bg: '#16A34A',
    category: 'word',
    featured: true,
  },
  {
    href: '/games/solitaire',
    name: 'Solitaire',
    description: 'Classic Klondike. Build foundations.',
    emoji: '🃏',
    bg: '#7C3AED',
    category: 'classic',
  },
  {
    href: '/games/brick-breaker',
    name: 'Brick Breaker',
    description: 'Bounce the ball. Destroy all bricks.',
    emoji: '🧱',
    bg: '#DC2626',
    category: 'arcade',
  },
];
