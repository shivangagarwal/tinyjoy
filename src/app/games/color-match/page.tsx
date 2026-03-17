import ColorMatchGame from '@/games/color-match/ColorMatchGame';

export const metadata = {
  title: 'Color Match — TinyJoy',
  description: 'Tap the matching tiles before time runs out.',
};

export default function ColorMatchPage() {
  return <ColorMatchGame />;
}
