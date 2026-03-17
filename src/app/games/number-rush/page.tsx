import NumberRushGame from '@/games/number-rush/NumberRushGame';

export const metadata = {
  title: 'Number Rush — TinyJoy',
  description: 'Tap 1 to 25 in order as fast as you can.',
};

export default function NumberRushPage() {
  return <NumberRushGame />;
}
