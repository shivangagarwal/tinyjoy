import WordScrambleGame from '@/games/word-scramble/WordScrambleGame';

export const metadata = {
  title: 'Word Scramble — TinyJoy',
  description: 'Unscramble as many words as you can in 60 seconds.',
};

export default function WordScramblePage() {
  return <WordScrambleGame />;
}
