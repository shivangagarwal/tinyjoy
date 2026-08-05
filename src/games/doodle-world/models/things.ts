/** Everyday-object models. */
import * as pc from 'playcanvas';
import { C, part, pair, root } from './parts';

export function house(): pc.Entity {
  const e = root('house');
  part(e, 'box', { p: [0, 0.45, 0], s: [1.3, 0.9, 1.05], c: C.cream });
  part(e, 'cone', { p: [0, 1.2, 0], s: [1.5, 0.65, 1.25], c: C.red });
  part(e, 'box', { p: [0, 0.28, 0.53], s: [0.32, 0.55, 0.06], c: C.darkBrown });
  part(e, 'sphere', { p: [0.1, 0.28, 0.57], s: 0.04, c: C.gold });
  pair(e, 'box', { x: 0.38, p: [0, 0.62, 0.53], s: [0.26, 0.26, 0.06], c: C.sky });
  part(e, 'box', { p: [0.42, 1.32, -0.2], s: [0.2, 0.45, 0.2], c: C.brown });
  return e;
}

export function door(): pc.Entity {
  const e = root('door');
  part(e, 'box', { p: [0, 0.78, 0], s: [0.95, 1.56, 0.14], c: C.brown });
  part(e, 'box', { p: [0, 0.76, 0], s: [0.72, 1.35, 0.18], c: C.darkBrown });
  part(e, 'box', { p: [0, 1.05, 0.1], s: [0.5, 0.42, 0.04], c: C.brown });
  part(e, 'box', { p: [0, 0.45, 0.1], s: [0.5, 0.55, 0.04], c: C.brown });
  part(e, 'sphere', { p: [0.26, 0.72, 0.12], s: 0.08, c: C.gold });
  return e;
}

export function chair(): pc.Entity {
  const e = root('chair');
  part(e, 'box', { p: [0, 0.55, 0], s: [0.72, 0.1, 0.72], c: C.brown });
  part(e, 'box', { p: [0, 1.0, -0.31], s: [0.72, 0.85, 0.1], c: C.brown });
  const legs: [number, number][] = [[0.28, 0.28], [-0.28, 0.28], [0.28, -0.28], [-0.28, -0.28]];
  for (const [x, z] of legs) {
    part(e, 'cylinder', { p: [x, 0.25, z], s: [0.09, 0.5, 0.09], c: C.darkBrown });
  }
  return e;
}

export function book(): pc.Entity {
  const e = root('book');
  part(e, 'box', { p: [0, 0.1, 0], s: [1.0, 0.2, 1.3], c: C.darkBlue });
  part(e, 'box', { p: [0.03, 0.11, 0.02], s: [0.92, 0.16, 1.24], c: C.white });
  part(e, 'box', { p: [-0.48, 0.1, 0], s: [0.08, 0.22, 1.3], c: C.navy });
  part(e, 'box', { p: [0.1, 0.21, 0], s: [0.55, 0.02, 0.9], c: C.sky });
  return e;
}

export function candle(): pc.Entity {
  const e = root('candle');
  part(e, 'cylinder', { p: [0, 0.5, 0], s: [0.38, 1.0, 0.38], c: C.cream });
  part(e, 'sphere', { p: [0.12, 0.98, 0.05], s: [0.1, 0.14, 0.1], c: C.white });
  part(e, 'sphere', { p: [-0.1, 0.96, -0.08], s: [0.08, 0.18, 0.08], c: C.white });
  part(e, 'cylinder', { p: [0, 1.05, 0], s: [0.03, 0.12, 0.03], c: C.black });
  part(e, 'cone', { p: [0, 1.2, 0], s: [0.16, 0.3, 0.16], c: C.amber, glow: C.orange });
  part(e, 'cylinder', { p: [0, 0.03, 0], s: [0.6, 0.06, 0.6], c: C.gold });
  return e;
}

export function clock(): pc.Entity {
  const e = root('clock');
  part(e, 'cylinder', { p: [0, 0.95, 0], e: [90, 0, 0], s: [0.95, 0.16, 0.95], c: C.white });
  part(e, 'torus', { p: [0, 0.95, 0], e: [90, 0, 0], s: [2.0, 0.9, 2.0], c: C.blue });
  part(e, 'box', { p: [0, 1.08, 0.09], s: [0.07, 0.3, 0.03], c: C.black });
  part(e, 'box', { p: [0.14, 0.95, 0.09], s: [0.32, 0.06, 0.03], c: C.black });
  part(e, 'sphere', { p: [0, 0.95, 0.1], s: 0.07, c: C.red });
  pair(e, 'sphere', { x: 0.3, p: [0, 1.62, 0], s: 0.18, c: C.gold });
  pair(e, 'cylinder', { x: 0.3, p: [0, 0.2, 0], e: [0, 0, 15], s: [0.07, 0.45, 0.07], c: C.darkGray });
  return e;
}

export function cup(): pc.Entity {
  const e = root('cup');
  part(e, 'cylinder', { p: [0, 0.35, 0], s: [0.62, 0.7, 0.62], c: C.white });
  part(e, 'cylinder', { p: [0, 0.68, 0], s: [0.52, 0.04, 0.52], c: C.brown });
  part(e, 'torus', { p: [0.38, 0.38, 0], e: [90, 90, 0], s: 0.55, c: C.white });
  part(e, 'sphere', { p: [0.1, 0.75, 0.05], s: [0.08, 0.05, 0.08], c: C.gray });
  return e;
}

export function spoon(): pc.Entity {
  const e = root('spoon');
  part(e, 'sphere', { p: [0, 0.09, 0.42], s: [0.4, 0.12, 0.5], c: C.gray });
  part(e, 'sphere', { p: [0, 0.12, 0.42], s: [0.28, 0.08, 0.38], c: C.darkGray });
  part(e, 'box', { p: [0, 0.07, -0.28], s: [0.13, 0.07, 0.85], c: C.gray });
  part(e, 'sphere', { p: [0, 0.07, -0.68], s: [0.16, 0.07, 0.2], c: C.gray });
  return e;
}

export function key(): pc.Entity {
  const e = root('key');
  part(e, 'torus', { p: [0, 0.1, -0.45], s: 0.85, c: C.gold });
  part(e, 'box', { p: [0, 0.1, 0.15], s: [0.14, 0.1, 0.95], c: C.gold });
  part(e, 'box', { p: [0.14, 0.1, 0.52], s: [0.16, 0.1, 0.12], c: C.gold });
  part(e, 'box', { p: [0.12, 0.1, 0.3], s: [0.12, 0.1, 0.1], c: C.gold });
  return e;
}

export function umbrella(): pc.Entity {
  const e = root('umbrella');
  part(e, 'sphere', { p: [0, 1.25, 0], s: [1.35, 0.55, 1.35], c: C.red });
  part(e, 'sphere', { p: [0, 1.28, 0], s: [1.0, 0.5, 1.0], c: C.darkRed });
  part(e, 'cylinder', { p: [0, 0.65, 0], s: [0.06, 1.3, 0.06], c: C.darkGray });
  part(e, 'cone', { p: [0, 1.6, 0], s: [0.08, 0.2, 0.08], c: C.darkGray });
  part(e, 'torus', { p: [0.12, 0.08, 0], e: [90, 90, 0], s: 0.3, c: C.darkGray });
  return e;
}

export function hat(): pc.Entity {
  const e = root('hat');
  part(e, 'cylinder', { p: [0, 0.05, 0], s: [1.05, 0.1, 1.05], c: C.black });
  part(e, 'cylinder', { p: [0, 0.45, 0], s: [0.62, 0.75, 0.62], c: C.black });
  part(e, 'cylinder', { p: [0, 0.16, 0], s: [0.64, 0.14, 0.64], c: C.red });
  return e;
}

export function crown(): pc.Entity {
  const e = root('crown');
  part(e, 'cylinder', { p: [0, 0.22, 0], s: [0.85, 0.4, 0.85], c: C.gold, glow: '#5c4500' });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    part(e, 'cone', { p: [Math.cos(a) * 0.36, 0.55, Math.sin(a) * 0.36], s: [0.18, 0.35, 0.18], c: C.gold });
  }
  part(e, 'sphere', { p: [0, 0.32, 0.43], s: 0.09, c: C.red });
  part(e, 'sphere', { p: [0.38, 0.32, -0.22], s: 0.09, c: C.blue });
  part(e, 'sphere', { p: [-0.38, 0.32, -0.22], s: 0.09, c: C.green });
  return e;
}

export function shoe(): pc.Entity {
  const e = root('shoe');
  part(e, 'box', { p: [0, 0.09, -0.05], s: [0.6, 0.14, 1.15], c: C.white });
  part(e, 'box', { p: [0, 0.3, -0.25], s: [0.55, 0.32, 0.7], c: C.red });
  part(e, 'sphere', { p: [0, 0.22, 0.35], s: [0.52, 0.3, 0.5], c: C.red });
  part(e, 'sphere', { p: [0, 0.28, 0.42], s: [0.4, 0.2, 0.4], c: C.white });
  part(e, 'box', { p: [0, 0.42, -0.02], s: [0.3, 0.04, 0.06], c: C.white });
  part(e, 'box', { p: [0, 0.38, 0.1], s: [0.3, 0.04, 0.06], c: C.white });
  return e;
}

export function eye(): pc.Entity {
  const e = root('eye');
  part(e, 'sphere', { p: [0, 0.6, 0], s: [0.95, 0.62, 0.42], c: C.white });
  part(e, 'sphere', { p: [0, 0.6, 0.16], s: [0.42, 0.42, 0.22], c: C.sky });
  part(e, 'sphere', { p: [0, 0.6, 0.28], s: [0.2, 0.2, 0.1], c: C.black });
  part(e, 'sphere', { p: [0.07, 0.68, 0.34], s: 0.05, c: C.white });
  return e;
}

export function smiley_face(): pc.Entity {
  const e = root('smiley_face');
  part(e, 'sphere', { p: [0, 0.8, 0], s: [1.05, 1.05, 0.4], c: C.yellow });
  pair(e, 'sphere', { x: 0.22, p: [0, 1.02, 0.17], s: [0.09, 0.14, 0.06], c: C.black });
  const smile = [-0.3, -0.15, 0, 0.15, 0.3];
  for (const x of smile) {
    const y = 0.55 - (0.09 - Math.abs(x) * 0.28) + 0.02;
    part(e, 'sphere', { p: [x, y, 0.18], s: 0.07, c: C.black });
  }
  return e;
}
