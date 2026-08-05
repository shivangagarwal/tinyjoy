/**
 * Kid-friendly subset of DoodleNet's 345 QuickDraw categories.
 * `id` must exactly match a line in public/models/doodlenet/class_names.txt.
 */
export interface DoodleCategory {
  /** QuickDraw class name (underscored, matches class_names.txt) */
  id: string;
  /** Display name */
  label: string;
  /** Big visual cue so pre-readers can play */
  emoji: string;
}

export const DOODLE_CATEGORIES: DoodleCategory[] = [
  { id: 'cat', label: 'cat', emoji: '🐱' },
  { id: 'dog', label: 'dog', emoji: '🐶' },
  { id: 'sun', label: 'sun', emoji: '☀️' },
  { id: 'house', label: 'house', emoji: '🏠' },
  { id: 'fish', label: 'fish', emoji: '🐟' },
  { id: 'car', label: 'car', emoji: '🚗' },
  { id: 'tree', label: 'tree', emoji: '🌳' },
  { id: 'star', label: 'star', emoji: '⭐' },
  { id: 'flower', label: 'flower', emoji: '🌸' },
  { id: 'ice_cream', label: 'ice cream', emoji: '🍦' },
  { id: 'apple', label: 'apple', emoji: '🍎' },
  { id: 'banana', label: 'banana', emoji: '🍌' },
  { id: 'bird', label: 'bird', emoji: '🐦' },
  { id: 'book', label: 'book', emoji: '📖' },
  { id: 'butterfly', label: 'butterfly', emoji: '🦋' },
  { id: 'cake', label: 'cake', emoji: '🎂' },
  { id: 'candle', label: 'candle', emoji: '🕯️' },
  { id: 'cloud', label: 'cloud', emoji: '☁️' },
  { id: 'cookie', label: 'cookie', emoji: '🍪' },
  { id: 'cup', label: 'cup', emoji: '☕' },
  { id: 'donut', label: 'donut', emoji: '🍩' },
  { id: 'door', label: 'door', emoji: '🚪' },
  { id: 'duck', label: 'duck', emoji: '🦆' },
  { id: 'elephant', label: 'elephant', emoji: '🐘' },
  { id: 'eye', label: 'eye', emoji: '👁️' },
  { id: 'smiley_face', label: 'smiley face', emoji: '🙂' },
  { id: 'hat', label: 'hat', emoji: '🎩' },
  { id: 'key', label: 'key', emoji: '🔑' },
  { id: 'leaf', label: 'leaf', emoji: '🍃' },
  { id: 'moon', label: 'moon', emoji: '🌙' },
  { id: 'mountain', label: 'mountain', emoji: '⛰️' },
  { id: 'mouse', label: 'mouse', emoji: '🐭' },
  { id: 'pizza', label: 'pizza', emoji: '🍕' },
  { id: 'rainbow', label: 'rainbow', emoji: '🌈' },
  { id: 'shoe', label: 'shoe', emoji: '👟' },
  { id: 'snake', label: 'snake', emoji: '🐍' },
  { id: 'snowman', label: 'snowman', emoji: '⛄' },
  { id: 'spider', label: 'spider', emoji: '🕷️' },
  { id: 'spoon', label: 'spoon', emoji: '🥄' },
  { id: 'airplane', label: 'airplane', emoji: '✈️' },
  { id: 'bicycle', label: 'bicycle', emoji: '🚲' },
  { id: 'sailboat', label: 'sailboat', emoji: '⛵' },
  { id: 'bus', label: 'bus', emoji: '🚌' },
  { id: 'chair', label: 'chair', emoji: '🪑' },
  { id: 'clock', label: 'clock', emoji: '🕐' },
  { id: 'crown', label: 'crown', emoji: '👑' },
  { id: 'umbrella', label: 'umbrella', emoji: '☂️' },
  { id: 'bear', label: 'bear', emoji: '🐻' },
  { id: 'bee', label: 'bee', emoji: '🐝' },
  { id: 'carrot', label: 'carrot', emoji: '🥕' },
];
