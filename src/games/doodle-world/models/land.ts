/**
 * Flat terrain tiles, ~2.2 units long, meant to be chained and rotated.
 * They sit just above the ground plane to avoid z-fighting.
 */
import * as pc from 'playcanvas';
import { C, part, pair, root } from './parts';

const LIFT = 0.03;

export function river(): pc.Entity {
  const e = root('river');
  part(e, 'box', { p: [0, LIFT + 0.02, 0], s: [1.1, 0.05, 2.25], c: C.darkBlue });
  part(e, 'box', { p: [0, LIFT + 0.045, 0], s: [0.9, 0.05, 2.15], c: C.blue });
  for (const z of [-0.7, 0, 0.7]) {
    part(e, 'sphere', { p: [0.12, LIFT + 0.08, z], s: [0.3, 0.03, 0.08], c: C.sky });
    part(e, 'sphere', { p: [-0.18, LIFT + 0.08, z + 0.32], s: [0.24, 0.03, 0.07], c: C.snow });
  }
  return e;
}

export function pond(): pc.Entity {
  const e = root('pond');
  part(e, 'cylinder', { p: [0, LIFT + 0.02, 0], s: [1.9, 0.04, 1.5], c: C.darkBlue });
  part(e, 'cylinder', { p: [0, LIFT + 0.045, 0], s: [1.65, 0.04, 1.28], c: C.blue });
  part(e, 'sphere', { p: [0.4, LIFT + 0.08, 0.25], s: [0.34, 0.04, 0.3], c: C.green });
  part(e, 'sphere', { p: [0.48, LIFT + 0.12, 0.2], s: 0.09, c: C.pink });
  part(e, 'sphere', { p: [-0.45, LIFT + 0.08, -0.2], s: [0.26, 0.04, 0.24], c: C.lime });
  part(e, 'sphere', { p: [-0.15, LIFT + 0.08, 0.35], s: [0.12, 0.03, 0.05], c: C.snow });
  return e;
}

export function bridge(): pc.Entity {
  const e = root('bridge');
  // Arched plank walkway
  const planks = 5;
  for (let i = 0; i < planks; i++) {
    const t = (i / (planks - 1)) * 2 - 1; // -1..1
    const y = 0.16 + (1 - t * t) * 0.32;
    part(e, 'box', {
      p: [0, y, t * 0.95],
      e: [t * -26, 0, 0],
      s: [0.95, 0.09, 0.55],
      c: C.brown,
    });
  }
  // Posts + rails
  for (const z of [-0.95, 0.95]) {
    pair(e, 'cylinder', { x: 0.42, p: [0, 0.38, z], s: [0.08, 0.55, 0.08], c: C.darkBrown });
  }
  pair(e, 'cylinder', { x: 0.42, p: [0, 0.82, 0], s: [0.08, 0.6, 0.08], c: C.darkBrown });
  for (const side of [1, -1]) {
    part(e, 'box', { p: [side * 0.42, 0.74, -0.55], e: [-22, 0, 0], s: [0.06, 0.06, 1.15], c: C.darkBrown });
    part(e, 'box', { p: [side * 0.42, 0.74, 0.55], e: [22, 0, 0], s: [0.06, 0.06, 1.15], c: C.darkBrown });
  }
  return e;
}

export function fence(): pc.Entity {
  const e = root('fence');
  for (const z of [-0.9, 0, 0.9]) {
    part(e, 'cylinder', { p: [0, 0.4, z], s: [0.12, 0.8, 0.12], c: C.brown });
    part(e, 'sphere', { p: [0, 0.82, z], s: 0.13, c: C.brown });
  }
  part(e, 'box', { p: [0, 0.55, 0], s: [0.07, 0.09, 2.1], c: C.tan });
  part(e, 'box', { p: [0, 0.28, 0], s: [0.07, 0.09, 2.1], c: C.tan });
  return e;
}

export function grass(): pc.Entity {
  const e = root('grass');
  const blades: [number, number, number, string][] = [
    [0, 0.5, 0, C.darkGreen], [0.22, 0.38, 0.1, C.green], [-0.2, 0.42, -0.06, C.lime],
    [0.08, 0.3, -0.22, C.green], [-0.12, 0.32, 0.22, C.darkGreen], [0.3, 0.26, -0.14, C.lime],
    [-0.32, 0.28, 0.08, C.green],
  ];
  for (const [x, h, z, c] of blades) {
    part(e, 'cone', { p: [x, h / 2, z], s: [0.14, h, 0.14], c });
  }
  part(e, 'sphere', { p: [0.18, 0.12, 0.24], s: 0.07, c: C.yellow });
  return e;
}

export function road(): pc.Entity {
  const e = root('road');
  part(e, 'box', { p: [0, LIFT + 0.02, 0], s: [1.5, 0.05, 2.25], c: C.darkGray });
  pair(e, 'box', { x: 0.68, p: [0, LIFT + 0.045, 0], s: [0.1, 0.05, 2.25], c: C.gray });
  for (const z of [-0.75, 0, 0.75]) {
    part(e, 'box', { p: [0, LIFT + 0.05, z], s: [0.09, 0.04, 0.4], c: C.amber });
  }
  return e;
}
