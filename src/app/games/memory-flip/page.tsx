import MemoryFlipGame from '@/games/memory-flip/MemoryFlipGame';

export const metadata = {
  title: 'Memory Flip — TinyJoy',
  description: 'Flip cards and find matching pairs before time runs out.',
};

export default function MemoryFlipPage() {
  return <MemoryFlipGame />;
}
