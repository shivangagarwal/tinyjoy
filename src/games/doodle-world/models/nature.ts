/**
 * Nature & sky models. Sky things (sun, moon, star, cloud) float — the world
 * module reads `float` from the registry and hovers them with a gentle bob.
 */
import * as pc from 'playcanvas';
import { C, part, root } from './parts';

export function sun(): pc.Entity {
  const e = root('sun');
  part(e, 'sphere', { p: [0, 0, 0], s: 1.0, c: C.yellow, glow: C.amber });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    part(e, 'cone', {
      p: [Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0],
      e: [0, 0, (a * 180) / Math.PI - 90],
      s: [0.2, 0.42, 0.2],
      c: C.orange,
      glow: C.orange,
    });
  }
  return e;
}

export function moon(): pc.Entity {
  const e = root('moon');
  part(e, 'sphere', { p: [0, 0, 0], s: 0.95, c: C.cream, glow: '#8a7f55' });
  part(e, 'sphere', { p: [0.22, 0.18, 0.38], s: 0.18, c: C.tan });
  part(e, 'sphere', { p: [-0.25, -0.1, 0.4], s: 0.22, c: C.tan });
  part(e, 'sphere', { p: [0.05, -0.3, 0.38], s: 0.14, c: C.tan });
  return e;
}

export function star(): pc.Entity {
  const e = root('star');
  part(e, 'sphere', { p: [0, 0, 0], s: 0.42, c: C.gold, glow: C.amber });
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + (i / 5) * Math.PI * 2;
    part(e, 'cone', {
      p: [Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0],
      e: [0, 0, (a * 180) / Math.PI - 90],
      s: [0.3, 0.55, 0.3],
      c: C.gold,
      glow: C.amber,
    });
  }
  return e;
}

export function cloud(): pc.Entity {
  const e = root('cloud');
  part(e, 'sphere', { p: [0, 0, 0], s: 0.8, c: C.white });
  part(e, 'sphere', { p: [0.55, -0.08, 0.06], s: 0.62, c: C.white });
  part(e, 'sphere', { p: [-0.52, -0.06, -0.05], s: 0.58, c: C.white });
  part(e, 'sphere', { p: [0.08, 0.3, -0.02], s: 0.6, c: C.white });
  return e;
}

export function rainbow(): pc.Entity {
  const e = root('rainbow');
  // Torus tubes can't be thinned independently of the ring, so each band is a
  // chain of spheres along a half-circle — reads as an arch from every angle.
  const bands: [string, number, number][] = [
    [C.red, 1.75, 0.3],
    [C.amber, 1.45, 0.28],
    [C.green, 1.15, 0.26],
    [C.blue, 0.85, 0.24],
  ];
  for (const [color, radius, size] of bands) {
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI;
      part(e, 'sphere', {
        p: [Math.cos(a) * radius, Math.sin(a) * radius, 0],
        s: size,
        c: color,
      });
    }
  }
  return e;
}

export function tree(): pc.Entity {
  const e = root('tree');
  part(e, 'cylinder', { p: [0, 0.5, 0], s: [0.3, 1.0, 0.3], c: C.brown });
  part(e, 'sphere', { p: [0, 1.35, 0], s: 1.1, c: C.green });
  part(e, 'sphere', { p: [0.38, 1.6, 0.12], s: 0.7, c: C.darkGreen });
  part(e, 'sphere', { p: [-0.32, 1.72, -0.08], s: 0.65, c: C.lime });
  return e;
}

export function leaf(): pc.Entity {
  const e = root('leaf');
  part(e, 'cylinder', { p: [0, 0.18, -0.5], e: [60, 0, 0], s: [0.08, 0.5, 0.08], c: C.darkGreen });
  part(e, 'sphere', { p: [0, 0.42, 0.12], e: [12, 0, 0], s: [0.85, 0.14, 1.1], c: C.green });
  part(e, 'box', { p: [0, 0.51, 0.12], e: [12, 0, 0], s: [0.06, 0.03, 0.95], c: C.darkGreen });
  return e;
}

export function flower(): pc.Entity {
  const e = root('flower');
  part(e, 'cylinder', { p: [0, 0.45, 0], s: [0.12, 0.9, 0.12], c: C.darkGreen });
  part(e, 'sphere', { p: [0.18, 0.42, 0], e: [0, 0, -40], s: [0.34, 0.08, 0.16], c: C.green });
  part(e, 'sphere', { p: [0, 1.05, 0], s: 0.34, c: C.gold });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    part(e, 'sphere', {
      p: [Math.cos(a) * 0.32, 1.05 + Math.sin(a) * 0.32, 0],
      e: [0, 0, (a * 180) / Math.PI],
      s: [0.3, 0.18, 0.1],
      c: C.pink,
    });
  }
  return e;
}

export function mountain(): pc.Entity {
  const e = root('mountain');
  part(e, 'cone', { p: [0, 0.8, 0], s: [1.8, 1.6, 1.8], c: C.gray });
  part(e, 'cone', { p: [0, 1.45, 0], s: [0.75, 0.5, 0.75], c: C.snow });
  part(e, 'cone', { p: [0.78, 0.5, -0.3], s: [1.1, 1.0, 1.1], c: C.darkGray });
  part(e, 'cone', { p: [0.78, 0.92, -0.3], s: [0.45, 0.32, 0.45], c: C.snow });
  return e;
}

export function snowman(): pc.Entity {
  const e = root('snowman');
  part(e, 'sphere', { p: [0, 0.45, 0], s: 0.95, c: C.snow });
  part(e, 'sphere', { p: [0, 1.2, 0], s: 0.7, c: C.snow });
  part(e, 'sphere', { p: [0, 1.8, 0], s: 0.52, c: C.snow });
  part(e, 'cone', { p: [0, 1.82, 0.35], e: [90, 0, 0], s: [0.12, 0.35, 0.12], c: C.orange });
  part(e, 'sphere', { p: [0.1, 1.92, 0.2], s: 0.06, c: C.black });
  part(e, 'sphere', { p: [-0.1, 1.92, 0.2], s: 0.06, c: C.black });
  part(e, 'sphere', { p: [0, 1.28, 0.3], s: 0.07, c: C.black });
  part(e, 'sphere', { p: [0, 1.05, 0.33], s: 0.07, c: C.black });
  part(e, 'cylinder', { p: [0, 2.08, 0], s: [0.55, 0.06, 0.55], c: C.black });
  part(e, 'cylinder', { p: [0, 2.22, 0], s: [0.34, 0.3, 0.34], c: C.black });
  part(e, 'cylinder', { p: [0.55, 1.35, 0], e: [0, 0, -60], s: [0.06, 0.7, 0.06], c: C.darkBrown });
  part(e, 'cylinder', { p: [-0.55, 1.35, 0], e: [0, 0, 60], s: [0.06, 0.7, 0.06], c: C.darkBrown });
  return e;
}
