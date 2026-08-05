/**
 * Doodle World's category set = the shared 50 doodle categories plus flat
 * "land" tiles kids chain into terrain (rivers, roads, bridges…).
 *
 * Land tiles with a real QuickDraw class are drawable — the robot can guess
 * them. `road` has no QuickDraw class (the robot was never taught one), so
 * it's palette-only: a nice built-in lesson that AI only knows what it
 * learned.
 */
import { DOODLE_CATEGORIES, type DoodleCategory } from '../guess-my-drawing/categories';

export interface WorldCategory extends DoodleCategory {
  /** Not recognizable from drawings — spawn via palette only */
  paletteOnly?: true;
}

export const LAND_CATEGORIES: WorldCategory[] = [
  { id: 'river', label: 'river', emoji: '🌊' },
  { id: 'pond', label: 'pond', emoji: '🪷' },
  { id: 'bridge', label: 'bridge', emoji: '🌉' },
  { id: 'fence', label: 'fence', emoji: '🚧' },
  { id: 'grass', label: 'grass', emoji: '🌱' },
  { id: 'road', label: 'road', emoji: '🛣️', paletteOnly: true },
];

/** Everything spawnable in the world (palette, models, save validation). */
export const WORLD_CATEGORIES: WorldCategory[] = [...DOODLE_CATEGORIES, ...LAND_CATEGORIES];

/** Everything the robot can guess from a drawing (excludes palette-only). */
export const RECOGNIZABLE_CATEGORIES: DoodleCategory[] = WORLD_CATEGORIES.filter(
  (c) => !c.paletteOnly,
);
