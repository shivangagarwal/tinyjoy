export const GAMES = [
  {
    href: '/games/color-match',
    name: 'Color Match',
    description: 'Tap matching tiles. 60 seconds.',
    emoji: '🎨',
    bg: '#3B82F6',
  },
  {
    href: '/games/memory-flip',
    name: 'Memory Flip',
    description: 'Find matching pairs. Beat the clock.',
    emoji: '🃏',
    bg: '#8B5CF6',
  },
  {
    href: '/games/number-rush',
    name: 'Number Rush',
    description: 'Tap 1→25 in order. How fast are you?',
    emoji: '⚡',
    bg: '#10B981',
  },
  {
    href: '/games/pattern-echo',
    name: 'Pattern Echo',
    description: 'Watch the sequence. Repeat it.',
    emoji: '🔮',
    bg: '#F59E0B',
  },
  {
    href: '/games/word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble words. 60 seconds.',
    emoji: '🔤',
    bg: '#EC4899',
  },
  {
    href: '/games/typing-speed',
    name: 'Typing Speed',
    description: 'Type a passage. How fast are you?',
    emoji: '⌨️',
    bg: '#06B6D4',
  },
  {
    href: '/games/reaction-time',
    name: 'Reaction Time',
    description: 'Tap when it turns green. 5 rounds.',
    emoji: '⚡',
    bg: '#22C55E',
  },
] as const;

export type Game = (typeof GAMES)[number];
