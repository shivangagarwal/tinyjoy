import PatternEchoGame from '@/games/pattern-echo/PatternEchoGame';

export const metadata = {
  title: 'Pattern Echo — TinyJoy',
  description: 'Watch the sequence, repeat it. How far can you go?',
};

export default function PatternEchoPage() {
  return <PatternEchoGame />;
}
