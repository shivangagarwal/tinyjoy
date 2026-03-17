/**
 * Haptic feedback via navigator.vibrate (best-effort, mobile only).
 */
export type HapticPattern = 'tap' | 'success' | 'error' | number | number[];

const PATTERNS: Record<string, number | number[]> = {
  tap: 10,
  success: [20, 30, 20],
  error: [50, 40, 50],
};

export function vibrate(pattern: HapticPattern = 'tap'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const p =
    typeof pattern === 'string'
      ? (PATTERNS[pattern] ?? 10)
      : pattern;
  navigator.vibrate(p);
}
