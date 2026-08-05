/** Food models. */
import * as pc from 'playcanvas';
import { C, part, root } from './parts';

export function apple(): pc.Entity {
  const e = root('apple');
  part(e, 'sphere', { p: [0, 0.38, 0], s: [0.78, 0.72, 0.78], c: C.red });
  part(e, 'cylinder', { p: [0, 0.8, 0], e: [0, 0, 8], s: [0.06, 0.25, 0.06], c: C.darkBrown });
  part(e, 'sphere', { p: [0.14, 0.88, 0], e: [0, 0, -35], s: [0.24, 0.06, 0.12], c: C.green });
  return e;
}

export function banana(): pc.Entity {
  const e = root('banana');
  part(e, 'cylinder', { p: [-0.42, 0.28, 0], e: [0, 0, -50], s: [0.24, 0.55, 0.24], c: C.yellow });
  part(e, 'cylinder', { p: [0, 0.42, 0], e: [0, 0, -90], s: [0.24, 0.6, 0.24], c: C.yellow });
  part(e, 'cylinder', { p: [0.42, 0.28, 0], e: [0, 0, 50], s: [0.24, 0.55, 0.24], c: C.yellow });
  part(e, 'sphere', { p: [-0.62, 0.1, 0], s: 0.12, c: C.darkBrown });
  part(e, 'sphere', { p: [0.62, 0.1, 0], s: 0.1, c: C.darkBrown });
  return e;
}

export function cake(): pc.Entity {
  const e = root('cake');
  part(e, 'cylinder', { p: [0, 0.18, 0], s: [1.05, 0.36, 1.05], c: C.cream });
  part(e, 'cylinder', { p: [0, 0.5, 0], s: [0.78, 0.3, 0.78], c: C.pink });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    part(e, 'sphere', { p: [Math.cos(a) * 0.39, 0.68, Math.sin(a) * 0.39], s: 0.1, c: C.white });
  }
  part(e, 'cylinder', { p: [0, 0.78, 0], s: [0.07, 0.3, 0.07], c: C.sky });
  part(e, 'cone', { p: [0, 0.98, 0], s: [0.1, 0.16, 0.1], c: C.amber, glow: C.amber });
  return e;
}

export function cookie(): pc.Entity {
  const e = root('cookie');
  part(e, 'cylinder', { p: [0, 0.08, 0], s: [0.95, 0.16, 0.95], c: C.tan });
  const chips: [number, number][] = [
    [0.25, 0.1], [-0.2, 0.25], [0.05, -0.28], [-0.3, -0.12], [0.32, -0.22], [-0.02, 0.05],
  ];
  for (const [x, z] of chips) {
    part(e, 'sphere', { p: [x, 0.17, z], s: 0.09, c: C.darkBrown });
  }
  return e;
}

export function donut(): pc.Entity {
  const e = root('donut');
  part(e, 'torus', { p: [0, 0.16, 0], s: 1.5, c: C.tan });
  part(e, 'torus', { p: [0, 0.22, 0], s: [1.5, 1.2, 1.5], c: C.pink });
  const sprinkleColors = [C.yellow, C.sky, C.green, C.white, C.purple, C.orange];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    part(e, 'box', {
      p: [Math.cos(a) * 0.45, 0.34, Math.sin(a) * 0.45],
      e: [0, (i * 63) % 180, 0],
      s: [0.03, 0.03, 0.12],
      c: sprinkleColors[i % sprinkleColors.length],
    });
  }
  return e;
}

export function ice_cream(): pc.Entity {
  const e = root('ice_cream');
  part(e, 'cone', { p: [0, 0.45, 0], e: [180, 0, 0], s: [0.55, 0.9, 0.55], c: C.tan });
  part(e, 'sphere', { p: [0, 1.02, 0], s: 0.52, c: C.pink });
  part(e, 'sphere', { p: [0, 1.32, 0], s: 0.12, c: C.darkRed });
  return e;
}

export function pizza(): pc.Entity {
  const e = root('pizza');
  part(e, 'cylinder', { p: [0, 0.06, 0], s: [1.1, 0.12, 1.1], c: C.amber });
  part(e, 'torus', { p: [0, 0.1, 0], s: [2.1, 0.6, 2.1], c: C.tan });
  part(e, 'cylinder', { p: [0, 0.11, 0], s: [0.92, 0.06, 0.92], c: C.orange });
  const tops: [number, number][] = [[0.28, 0.1], [-0.25, 0.22], [0.05, -0.3], [-0.28, -0.18], [0.3, -0.28], [0, 0.32]];
  for (const [x, z] of tops) {
    part(e, 'cylinder', { p: [x, 0.16, z], s: [0.18, 0.04, 0.18], c: C.darkRed });
  }
  return e;
}

export function carrot(): pc.Entity {
  const e = root('carrot');
  part(e, 'cone', { p: [0.15, 0.18, 0], e: [0, 0, 90], s: [0.35, 1.1, 0.35], c: C.orange });
  part(e, 'cone', { p: [-0.5, 0.22, 0], e: [0, 0, -60], s: [0.1, 0.4, 0.1], c: C.green });
  part(e, 'cone', { p: [-0.55, 0.2, 0.12], e: [40, 0, -50], s: [0.09, 0.35, 0.09], c: C.darkGreen });
  part(e, 'cone', { p: [-0.55, 0.2, -0.12], e: [-40, 0, -50], s: [0.09, 0.35, 0.09], c: C.green });
  return e;
}
