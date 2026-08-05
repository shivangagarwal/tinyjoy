/** Animal models — chunky toy-style, facing +z. */
import * as pc from 'playcanvas';
import { C, part, pair, root } from './parts';

export function cat(): pc.Entity {
  const e = root('cat');
  part(e, 'sphere', { p: [0, 0.42, -0.05], s: [0.55, 0.45, 0.8], c: C.gray });
  part(e, 'sphere', { p: [0, 0.85, 0.4], s: 0.45, c: C.gray });
  pair(e, 'cone', { x: 0.16, p: [0, 1.14, 0.38], s: [0.15, 0.24, 0.1], c: C.gray });
  pair(e, 'sphere', { x: 0.1, p: [0, 0.9, 0.6], s: 0.055, c: C.black });
  part(e, 'sphere', { p: [0, 0.8, 0.62], s: 0.05, c: C.hotPink });
  pair(e, 'cylinder', { x: 0.28, p: [0, 0.18, 0.22], s: [0.12, 0.36, 0.12], c: C.gray });
  pair(e, 'cylinder', { x: 0.28, p: [0, 0.18, -0.32], s: [0.12, 0.36, 0.12], c: C.gray });
  part(e, 'cylinder', { p: [0.05, 0.62, -0.52], e: [35, 0, 0], s: [0.09, 0.6, 0.09], c: C.darkGray });
  return e;
}

export function dog(): pc.Entity {
  const e = root('dog');
  part(e, 'sphere', { p: [0, 0.45, -0.05], s: [0.6, 0.5, 0.85], c: C.tan });
  part(e, 'sphere', { p: [0, 0.92, 0.42], s: 0.48, c: C.tan });
  part(e, 'sphere', { p: [0, 0.85, 0.68], s: [0.24, 0.2, 0.26], c: C.brown });
  part(e, 'sphere', { p: [0, 0.94, 0.8], s: 0.07, c: C.black });
  pair(e, 'sphere', { x: 0.11, p: [0, 1.02, 0.62], s: 0.055, c: C.black });
  pair(e, 'sphere', { x: 0.26, p: [0, 0.98, 0.35], s: [0.1, 0.26, 0.16], c: C.brown });
  pair(e, 'cylinder', { x: 0.3, p: [0, 0.19, 0.25], s: [0.13, 0.38, 0.13], c: C.tan });
  pair(e, 'cylinder', { x: 0.3, p: [0, 0.19, -0.35], s: [0.13, 0.38, 0.13], c: C.tan });
  part(e, 'cone', { p: [0, 0.75, -0.5], e: [-40, 0, 0], s: [0.12, 0.45, 0.12], c: C.brown });
  return e;
}

export function bird(): pc.Entity {
  const e = root('bird');
  part(e, 'sphere', { p: [0, 0.52, 0], s: [0.5, 0.55, 0.6], c: C.blue });
  part(e, 'sphere', { p: [0, 0.98, 0.26], s: 0.34, c: C.blue });
  part(e, 'cone', { p: [0, 0.96, 0.52], e: [90, 0, 0], s: [0.1, 0.22, 0.1], c: C.orange });
  pair(e, 'sphere', { x: 0.09, p: [0, 1.05, 0.42], s: 0.05, c: C.black });
  pair(e, 'sphere', { x: 0.28, p: [0, 0.55, -0.02], e: [0, 0, 25], s: [0.12, 0.35, 0.3], c: C.darkBlue });
  part(e, 'sphere', { p: [0, 0.5, -0.38], e: [-30, 0, 0], s: [0.22, 0.08, 0.3], c: C.darkBlue });
  pair(e, 'cylinder', { x: 0.1, p: [0, 0.12, 0.02], s: [0.04, 0.24, 0.04], c: C.orange });
  return e;
}

export function duck(): pc.Entity {
  const e = root('duck');
  part(e, 'sphere', { p: [0, 0.4, -0.05], s: [0.55, 0.45, 0.75], c: C.yellow });
  part(e, 'sphere', { p: [0, 0.85, 0.3], s: 0.34, c: C.yellow });
  part(e, 'box', { p: [0, 0.8, 0.55], s: [0.24, 0.07, 0.28], c: C.orange });
  pair(e, 'sphere', { x: 0.09, p: [0, 0.92, 0.42], s: 0.05, c: C.black });
  pair(e, 'sphere', { x: 0.26, p: [0, 0.42, -0.08], e: [0, 0, 15], s: [0.1, 0.28, 0.4], c: C.gold });
  part(e, 'sphere', { p: [0, 0.45, -0.42], e: [-35, 0, 0], s: [0.18, 0.07, 0.22], c: C.gold });
  return e;
}

export function elephant(): pc.Entity {
  const e = root('elephant');
  part(e, 'sphere', { p: [0, 0.72, -0.15], s: [0.85, 0.7, 1.0], c: C.gray });
  part(e, 'sphere', { p: [0, 1.05, 0.5], s: 0.55, c: C.gray });
  part(e, 'cylinder', { p: [0, 0.85, 0.82], e: [25, 0, 0], s: [0.16, 0.45, 0.16], c: C.gray });
  part(e, 'cylinder', { p: [0, 0.55, 0.95], e: [-10, 0, 0], s: [0.13, 0.4, 0.13], c: C.gray });
  pair(e, 'sphere', { x: 0.52, p: [0, 1.15, 0.42], s: [0.34, 0.42, 0.1], c: C.darkGray });
  pair(e, 'sphere', { x: 0.14, p: [0, 1.18, 0.92], s: 0.055, c: C.black });
  pair(e, 'cylinder', { x: 0.38, p: [0, 0.26, 0.28], s: [0.22, 0.52, 0.22], c: C.gray });
  pair(e, 'cylinder', { x: 0.38, p: [0, 0.26, -0.55], s: [0.22, 0.52, 0.22], c: C.gray });
  part(e, 'cylinder', { p: [0, 0.7, -0.95], e: [30, 0, 0], s: [0.05, 0.4, 0.05], c: C.darkGray });
  return e;
}

export function mouse(): pc.Entity {
  const e = root('mouse');
  part(e, 'sphere', { p: [0, 0.28, -0.05], s: [0.42, 0.34, 0.55], c: C.gray });
  part(e, 'sphere', { p: [0, 0.45, 0.32], s: [0.3, 0.28, 0.34], c: C.gray });
  part(e, 'sphere', { p: [0, 0.42, 0.55], s: 0.06, c: C.hotPink });
  pair(e, 'sphere', { x: 0.16, p: [0, 0.68, 0.22], s: [0.18, 0.18, 0.06], c: C.pink });
  pair(e, 'sphere', { x: 0.08, p: [0, 0.5, 0.48], s: 0.04, c: C.black });
  part(e, 'cylinder', { p: [0, 0.12, -0.5], e: [80, 0, 0], s: [0.04, 0.55, 0.04], c: C.pink });
  return e;
}

export function snake(): pc.Entity {
  const e = root('snake');
  const wiggle: [number, number][] = [
    [-0.85, 0], [-0.5, 0.3], [-0.12, 0.12], [0.25, -0.25], [0.62, -0.05],
  ];
  for (const [x, z] of wiggle) {
    part(e, 'sphere', { p: [x, 0.18, z], s: 0.36, c: C.green });
  }
  part(e, 'sphere', { p: [0.95, 0.24, 0.12], s: 0.42, c: C.darkGreen });
  pair(e, 'sphere', { x: 0.12, p: [0.95, 0.38, 0.26], s: 0.05, c: C.black });
  part(e, 'box', { p: [0.95, 0.2, 0.38], s: [0.05, 0.03, 0.18], c: C.red });
  return e;
}

export function spider(): pc.Entity {
  const e = root('spider');
  part(e, 'sphere', { p: [0, 0.52, -0.12], s: [0.5, 0.45, 0.55], c: C.black });
  part(e, 'sphere', { p: [0, 0.5, 0.32], s: 0.3, c: C.darkGray });
  pair(e, 'sphere', { x: 0.09, p: [0, 0.58, 0.55], s: 0.05, c: C.red });
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.28 - i * 0.2;
      part(e, 'cylinder', {
        p: [side * 0.42, 0.35, z],
        e: [0, 0, side * -55],
        s: [0.05, 0.75, 0.05],
        c: C.black,
      });
    }
  }
  return e;
}

export function bee(): pc.Entity {
  const e = root('bee');
  part(e, 'sphere', { p: [0, 0, 0], s: [0.5, 0.45, 0.65], c: C.yellow });
  part(e, 'sphere', { p: [0, 0, -0.05], s: [0.52, 0.47, 0.18], c: C.black });
  part(e, 'sphere', { p: [0, 0, -0.28], s: [0.46, 0.42, 0.14], c: C.black });
  part(e, 'cone', { p: [0, 0, -0.45], e: [-90, 0, 0], s: [0.12, 0.25, 0.12], c: C.black });
  part(e, 'sphere', { p: [0, 0.05, 0.36], s: 0.28, c: C.yellow });
  pair(e, 'sphere', { x: 0.09, p: [0, 0.12, 0.55], s: 0.05, c: C.black });
  pair(e, 'sphere', { x: 0.28, p: [0, 0.35, -0.05], e: [0, 0, 20], s: [0.32, 0.1, 0.42], c: C.snow });
  return e;
}

export function butterfly(): pc.Entity {
  const e = root('butterfly');
  part(e, 'sphere', { p: [0, 0, 0.05], s: [0.14, 0.16, 0.55], c: C.darkBrown });
  part(e, 'sphere', { p: [0, 0.05, 0.38], s: 0.16, c: C.darkBrown });
  pair(e, 'sphere', { x: 0.42, p: [0, 0.12, 0.15], e: [0, 0, 12], s: [0.55, 0.08, 0.42], c: C.pink });
  pair(e, 'sphere', { x: 0.34, p: [0, 0.08, -0.28], e: [0, 0, 8], s: [0.4, 0.07, 0.32], c: C.purple });
  pair(e, 'sphere', { x: 0.18, p: [0.12, 0.12, 0.15], s: 0.07, c: C.amber });
  return e;
}

export function bear(): pc.Entity {
  const e = root('bear');
  part(e, 'sphere', { p: [0, 0.68, -0.05], s: [0.8, 0.7, 0.9], c: C.brown });
  part(e, 'sphere', { p: [0, 1.32, 0.28], s: 0.52, c: C.brown });
  part(e, 'sphere', { p: [0, 1.25, 0.55], s: [0.24, 0.18, 0.2], c: C.tan });
  part(e, 'sphere', { p: [0, 1.32, 0.66], s: 0.06, c: C.black });
  pair(e, 'sphere', { x: 0.1, p: [0, 1.45, 0.5], s: 0.05, c: C.black });
  pair(e, 'sphere', { x: 0.27, p: [0, 1.62, 0.22], s: 0.16, c: C.tan });
  pair(e, 'cylinder', { x: 0.35, p: [0, 0.22, 0.3], s: [0.2, 0.45, 0.2], c: C.brown });
  pair(e, 'cylinder', { x: 0.35, p: [0, 0.22, -0.4], s: [0.2, 0.45, 0.2], c: C.brown });
  return e;
}

export function fish(): pc.Entity {
  const e = root('fish');
  part(e, 'sphere', { p: [0, 0, 0.1], s: [0.42, 0.55, 0.85], c: C.teal });
  part(e, 'sphere', { p: [0, 0, -0.5], e: [45, 0, 0], s: [0.1, 0.5, 0.35], c: C.blue });
  part(e, 'sphere', { p: [0, 0.35, 0.05], e: [20, 0, 0], s: [0.08, 0.3, 0.3], c: C.blue });
  pair(e, 'sphere', { x: 0.24, p: [0, -0.05, 0.15], e: [0, 0, 30], s: [0.06, 0.2, 0.25], c: C.blue });
  pair(e, 'sphere', { x: 0.15, p: [0, 0.12, 0.48], s: 0.06, c: C.black });
  part(e, 'sphere', { p: [0, -0.05, 0.55], s: [0.16, 0.1, 0.12], c: C.hotPink });
  return e;
}
