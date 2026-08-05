/**
 * Shared building blocks for Doodle World's procedural toy models.
 * Every model is assembled from PlayCanvas primitives with a cohesive
 * pastel palette — no external 3D assets, everything ships in code.
 */
import * as pc from 'playcanvas';

// ── Palette ────────────────────────────────────────────────────────────────

export const C = {
  white: '#FFFFFF',
  cream: '#FFF3D6',
  black: '#3A3A3A',
  gray: '#9AA0A6',
  darkGray: '#5F6368',
  brown: '#8D6E63',
  darkBrown: '#6D4C41',
  tan: '#D7B899',
  red: '#EF5350',
  darkRed: '#C62828',
  orange: '#FFA726',
  amber: '#FFC107',
  yellow: '#FFEE58',
  gold: '#F9A825',
  green: '#66BB6A',
  darkGreen: '#388E3C',
  lime: '#9CCC65',
  teal: '#26A69A',
  blue: '#42A5F5',
  darkBlue: '#1E88E5',
  navy: '#3949AB',
  sky: '#81D4FA',
  purple: '#AB47BC',
  pink: '#F48FB1',
  hotPink: '#EC407A',
  snow: '#F5F9FF',
} as const;

// ── Materials ──────────────────────────────────────────────────────────────

const matCache = new Map<string, pc.StandardMaterial>();

export function mat(hex: string, emissiveHex?: string): pc.StandardMaterial {
  const key = `${hex}|${emissiveHex ?? ''}`;
  const cached = matCache.get(key);
  if (cached) return cached;

  const m = new pc.StandardMaterial();
  m.diffuse = new pc.Color().fromString(hex);
  m.gloss = 0.4;
  m.metalness = 0;
  m.useMetalness = true;
  if (emissiveHex) {
    m.emissive = new pc.Color().fromString(emissiveHex);
    m.emissiveIntensity = 0.6;
  }
  m.update();
  matCache.set(key, m);
  return m;
}

/** Call when tearing the world down so materials rebuild cleanly next time. */
export function clearMaterialCache(): void {
  matCache.forEach((m) => m.destroy());
  matCache.clear();
}

// ── Part builder ───────────────────────────────────────────────────────────

export type PartType = 'box' | 'sphere' | 'cone' | 'cylinder' | 'capsule' | 'torus' | 'plane';

export interface PartOpts {
  /** Position within the model, in model units */
  p?: [number, number, number];
  /** Euler rotation in degrees */
  e?: [number, number, number];
  /** Scale — uniform number or per-axis */
  s?: number | [number, number, number];
  /** Palette color (hex) */
  c: string;
  /** Optional emissive hex for glowing bits (sun, candle flame) */
  glow?: string;
}

export function part(parent: pc.Entity, type: PartType, opts: PartOpts): pc.Entity {
  const e = new pc.Entity(type);
  e.addComponent('render', { type });
  e.render!.material = mat(opts.c, opts.glow);
  if (opts.p) e.setLocalPosition(opts.p[0], opts.p[1], opts.p[2]);
  if (opts.e) e.setLocalEulerAngles(opts.e[0], opts.e[1], opts.e[2]);
  if (opts.s !== undefined) {
    const s = opts.s;
    if (typeof s === 'number') e.setLocalScale(s, s, s);
    else e.setLocalScale(s[0], s[1], s[2]);
  }
  parent.addChild(e);
  return e;
}

/** Two mirrored parts (legs, ears, wheels…) at ±x. */
export function pair(parent: pc.Entity, type: PartType, opts: PartOpts & { x: number }): void {
  const { x, ...rest } = opts;
  const base = rest.p ?? [0, 0, 0];
  part(parent, type, { ...rest, p: [x, base[1], base[2]] });
  part(parent, type, { ...rest, p: [-x, base[1], base[2]] });
}

/** Root entity every builder starts from. */
export function root(name: string): pc.Entity {
  return new pc.Entity(`model:${name}`);
}
