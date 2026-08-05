/** Vehicle models — length along the x axis. */
import * as pc from 'playcanvas';
import { C, part, pair, root } from './parts';

function wheel(e: pc.Entity, x: number, z: number, r = 0.34): void {
  part(e, 'cylinder', { p: [x, r * 0.62, z], e: [90, 0, 0], s: [r, 0.18, r], c: C.black });
  part(e, 'cylinder', { p: [x, r * 0.62, z], e: [90, 0, 0], s: [r * 0.5, 0.2, r * 0.5], c: C.gray });
}

export function car(): pc.Entity {
  const e = root('car');
  part(e, 'box', { p: [0, 0.42, 0], s: [1.6, 0.4, 0.85], c: C.red });
  part(e, 'box', { p: [-0.1, 0.75, 0], s: [0.85, 0.4, 0.78], c: C.red });
  part(e, 'box', { p: [-0.1, 0.75, 0], s: [0.7, 0.28, 0.8], c: C.sky });
  wheel(e, 0.52, 0.44);
  wheel(e, 0.52, -0.44);
  wheel(e, -0.52, 0.44);
  wheel(e, -0.52, -0.44);
  pair(e, 'sphere', { x: 0.28, p: [0.78, 0.45, 0], s: 0.09, c: C.yellow });
  return e;
}

export function bus(): pc.Entity {
  const e = root('bus');
  part(e, 'box', { p: [0, 0.72, 0], s: [2.1, 0.85, 0.9], c: C.gold });
  part(e, 'box', { p: [0, 1.17, 0], s: [2.0, 0.06, 0.85], c: C.white });
  for (const x of [-0.7, -0.2, 0.3]) {
    part(e, 'box', { p: [x, 0.88, 0.44], s: [0.32, 0.3, 0.05], c: C.sky });
    part(e, 'box', { p: [x, 0.88, -0.44], s: [0.32, 0.3, 0.05], c: C.sky });
  }
  part(e, 'box', { p: [0.9, 0.85, 0], s: [0.3, 0.35, 0.8], c: C.sky });
  part(e, 'box', { p: [0, 0.52, 0], s: [2.12, 0.1, 0.92], c: C.darkGray });
  wheel(e, 0.68, 0.42, 0.32);
  wheel(e, 0.68, -0.42, 0.32);
  wheel(e, -0.68, 0.42, 0.32);
  wheel(e, -0.68, -0.42, 0.32);
  return e;
}

export function airplane(): pc.Entity {
  const e = root('airplane');
  part(e, 'capsule', { p: [0, 0, 0], e: [0, 0, 90], s: [0.5, 0.85, 0.5], c: C.white });
  part(e, 'sphere', { p: [0.85, 0, 0], s: [0.3, 0.4, 0.4], c: C.red });
  part(e, 'box', { p: [0.1, 0.05, 0], s: [0.55, 0.08, 2.2], c: C.red });
  part(e, 'box', { p: [-0.78, 0.35, 0], s: [0.08, 0.6, 0.35], c: C.red });
  part(e, 'box', { p: [-0.78, 0.15, 0], s: [0.3, 0.07, 0.9], c: C.red });
  for (const z of [0.25, -0.25]) {
    part(e, 'box', { p: [0.35, 0.18, z], s: [0.35, 0.18, 0.06], c: C.sky });
  }
  return e;
}

export function bicycle(): pc.Entity {
  const e = root('bicycle');
  part(e, 'torus', { p: [0.55, 0.42, 0], e: [90, 0, 0], s: 1.05, c: C.black });
  part(e, 'torus', { p: [-0.55, 0.42, 0], e: [90, 0, 0], s: 1.05, c: C.black });
  part(e, 'cylinder', { p: [0, 0.62, 0], e: [0, 0, 65], s: [0.06, 1.1, 0.06], c: C.red });
  part(e, 'cylinder', { p: [-0.28, 0.62, 0], e: [0, 0, -55], s: [0.06, 0.95, 0.06], c: C.red });
  part(e, 'cylinder', { p: [0.42, 0.75, 0], e: [0, 0, 15], s: [0.06, 0.75, 0.06], c: C.red });
  part(e, 'box', { p: [-0.42, 1.05, 0], s: [0.3, 0.08, 0.12], c: C.darkBrown });
  part(e, 'cylinder', { p: [0.52, 1.15, 0], e: [90, 0, 0], s: [0.05, 0.5, 0.05], c: C.darkGray });
  return e;
}

export function sailboat(): pc.Entity {
  const e = root('sailboat');
  part(e, 'box', { p: [0, 0.22, 0], s: [1.5, 0.32, 0.62], c: C.brown });
  part(e, 'box', { p: [0, 0.4, 0], s: [1.6, 0.08, 0.7], c: C.darkBrown });
  part(e, 'cone', { p: [0.85, 0.25, 0], e: [0, 0, -90], s: [0.3, 0.35, 0.62], c: C.brown });
  part(e, 'cylinder', { p: [0, 1.15, 0], s: [0.06, 1.5, 0.06], c: C.darkBrown });
  part(e, 'box', { p: [0.32, 1.25, 0], s: [0.6, 1.0, 0.03], c: C.white });
  part(e, 'box', { p: [-0.28, 1.05, 0], s: [0.5, 0.7, 0.03], c: C.cream });
  part(e, 'box', { p: [0.05, 1.95, 0], s: [0.28, 0.14, 0.02], c: C.red });
  return e;
}
