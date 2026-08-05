/**
 * Doodle World engine core — a self-contained PlayCanvas scene the React
 * shell talks to through a small imperative API. Owns the render loop,
 * cameras, input, object lifecycle, and localStorage-friendly serialization.
 *
 * Runs fully client-side. Loaded via dynamic import so PlayCanvas never
 * enters the server bundle or other routes.
 */
import * as pc from 'playcanvas';
import { MODELS, type ModelDef } from './models';
import { C, mat, clearMaterialCache } from './models/parts';
import { WORLD_CATEGORIES } from './categories';

export type SkyTheme = 'day' | 'sunset' | 'night';
export type CameraMode = 'orbit' | 'walk';

export interface WorldSaveObject {
  c: string;
  x: number;
  z: number;
  yaw: number;
  s: number;
}

export interface WorldSave {
  v: 1;
  theme: SkyTheme;
  objects: WorldSaveObject[];
}

export interface WorldEvents {
  onCountChange?: (count: number) => void;
  onSelect?: (categoryId: string | null) => void;
}

interface WorldObject {
  id: number;
  category: string;
  def: ModelDef;
  ent: pc.Entity;
  scale: number;
  targetScale: number;
  yaw: number;
  targetYaw: number;
  x: number;
  z: number;
  baseY: number;
  bobPhase: number;
  spawnT: number;
  removeT: number | null;
}

const GROUND_R = 26;
export const MAX_OBJECTS = 150;
const TAP_SLOP_PX = 9;

interface ThemeDef {
  sky: string;
  fog: string;
  fogStart: number;
  fogEnd: number;
  ambient: string;
  sunColor: string;
  sunIntensity: number;
  fillIntensity: number;
  ground: string;
  rim: string;
}

const THEMES: Record<SkyTheme, ThemeDef> = {
  day: {
    sky: '#8ED4F7', fog: '#BFE7F9', fogStart: 30, fogEnd: 90,
    ambient: '#93A9BC', sunColor: '#FFFFFF', sunIntensity: 1.7, fillIntensity: 0.5,
    ground: '#7BC86C', rim: '#69B25C',
  },
  sunset: {
    sky: '#FFAF7B', fog: '#FFD1A3', fogStart: 26, fogEnd: 80,
    ambient: '#A98BA0', sunColor: '#FFC58A', sunIntensity: 1.35, fillIntensity: 0.4,
    ground: '#83B569', rim: '#6FA05A',
  },
  night: {
    sky: '#1B2A52', fog: '#26375F', fogStart: 22, fogEnd: 70,
    ambient: '#55688F', sunColor: '#BFD2FF', sunIntensity: 0.7, fillIntensity: 0.3,
    ground: '#4E7A52', rim: '#436A48',
  },
};

export class DoodleWorld {
  private canvas: HTMLCanvasElement;
  private events: WorldEvents;
  private app: pc.Application | null = null;
  private camera!: pc.Entity;
  private sun!: pc.Entity;
  private fill!: pc.Entity;
  private groundEnt!: pc.Entity;
  private rimEnt!: pc.Entity;
  private stars!: pc.Entity;
  private ring!: pc.Entity;

  private objects: WorldObject[] = [];
  private nextId = 1;
  private selectedId: number | null = null;
  private time = 0;

  theme: SkyTheme = 'day';
  mode: CameraMode = 'orbit';

  // Orbit rig
  private orbitYaw = 35;
  private orbitPitch = 28;
  private orbitDist = 14;
  private orbitTarget = new pc.Vec3(0, 0.6, 0);
  private orbitYawCur = 35;
  private orbitPitchCur = 28;
  private orbitDistCur = 16;

  // Walk rig
  private walkPos = new pc.Vec3(0, 0, 8);
  private walkYaw = 180;
  private walkPitch = -5;
  private joy = { x: 0, y: 0 };
  private keys = new Set<string>();

  // Pointer state
  private pointers = new Map<number, { x: number; y: number; sx: number; sy: number; moved: boolean }>();
  private pinchDist = 0;
  private draggingObject = false;

  private disposed = false;

  static isSupported(): boolean {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  }

  constructor(canvas: HTMLCanvasElement, events: WorldEvents = {}) {
    this.canvas = canvas;
    this.events = events;
  }

  init(): void {
    const isSmall = typeof window !== 'undefined' && window.innerWidth < 768;

    const app = new pc.Application(this.canvas, {
      graphicsDeviceOptions: {
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true, // needed for the photo button
        powerPreference: 'high-performance',
      },
    });
    this.app = app;
    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // Dev sanity: every spawnable category needs a model
    for (const cat of WORLD_CATEGORIES) {
      if (!MODELS[cat.id]) console.warn(`DoodleWorld: no model for category "${cat.id}"`);
    }

    // ── Camera ──
    this.camera = new pc.Entity('camera');
    this.camera.addComponent('camera', {
      clearColor: new pc.Color().fromString(THEMES.day.sky),
      fov: 50,
      nearClip: 0.1,
      farClip: 220,
    });
    app.root.addChild(this.camera);

    // ── Lights ──
    this.sun = new pc.Entity('sun-light');
    this.sun.addComponent('light', {
      type: 'directional',
      castShadows: true,
      shadowBias: 0.2,
      normalOffsetBias: 0.05,
      shadowDistance: 55,
      shadowResolution: isSmall ? 1024 : 2048,
      intensity: 1.7,
    });
    this.sun.setEulerAngles(52, 35, 0);
    app.root.addChild(this.sun);

    this.fill = new pc.Entity('fill-light');
    this.fill.addComponent('light', { type: 'directional', castShadows: false, intensity: 0.5 });
    this.fill.setEulerAngles(40, 215, 0);
    app.root.addChild(this.fill);

    // ── Ground ──
    this.groundEnt = new pc.Entity('ground');
    this.groundEnt.addComponent('render', { type: 'cylinder' });
    this.groundEnt.setLocalScale(GROUND_R * 2, 0.6, GROUND_R * 2);
    this.groundEnt.setLocalPosition(0, -0.3, 0);
    app.root.addChild(this.groundEnt);

    this.rimEnt = new pc.Entity('ground-rim');
    this.rimEnt.addComponent('render', { type: 'cylinder' });
    this.rimEnt.setLocalScale(GROUND_R * 2 + 2.5, 0.5, GROUND_R * 2 + 2.5);
    this.rimEnt.setLocalPosition(0, -0.45, 0);
    app.root.addChild(this.rimEnt);

    // ── Night stars ──
    this.stars = new pc.Entity('stars');
    const starMat = new pc.StandardMaterial();
    starMat.diffuse = new pc.Color(1, 1, 1);
    starMat.emissive = new pc.Color(1, 1, 1);
    starMat.useFog = false; // stars must not fade into the night fog
    starMat.update();
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 42 + Math.random() * 45;
      const y = 10 + Math.random() * 48;
      const s = new pc.Entity('star');
      s.addComponent('render', { type: 'sphere' });
      s.render!.material = starMat;
      s.setLocalPosition(Math.cos(a) * r, y, Math.sin(a) * r);
      const sc = 0.35 + Math.random() * 0.4;
      s.setLocalScale(sc, sc, sc);
      this.stars.addChild(s);
    }
    this.stars.enabled = false;
    app.root.addChild(this.stars);

    // ── Selection ring ──
    this.ring = new pc.Entity('selection-ring');
    this.ring.addComponent('render', { type: 'torus' });
    this.ring.render!.material = mat(C.amber, C.amber);
    this.ring.enabled = false;
    app.root.addChild(this.ring);

    this.applyTheme(this.theme);
    this.bindInput();

    app.on('update', (dt: number) => this.update(dt));
    app.start();
  }

  // ── Theme ────────────────────────────────────────────────────────────────

  setTheme(theme: SkyTheme): void {
    this.theme = theme;
    this.applyTheme(theme);
  }

  private applyTheme(theme: SkyTheme): void {
    if (!this.app) return;
    const t = THEMES[theme];
    this.camera.camera!.clearColor = new pc.Color().fromString(t.sky);
    const scene = this.app.scene;
    scene.ambientLight = new pc.Color().fromString(t.ambient);
    scene.fog.type = pc.FOG_LINEAR;
    scene.fog.color = new pc.Color().fromString(t.fog);
    scene.fog.start = t.fogStart;
    scene.fog.end = t.fogEnd;
    this.sun.light!.color = new pc.Color().fromString(t.sunColor);
    this.sun.light!.intensity = t.sunIntensity;
    this.fill.light!.intensity = t.fillIntensity;
    this.groundEnt.render!.material = mat(t.ground);
    this.rimEnt.render!.material = mat(t.rim);
    this.stars.enabled = theme === 'night';
  }

  // ── Camera modes ─────────────────────────────────────────────────────────

  setMode(mode: CameraMode): void {
    if (mode === this.mode) return;
    if (mode === 'walk') {
      // Enter walk roughly where the orbit camera is looking from
      const pos = this.camera.getPosition();
      const inside = Math.hypot(pos.x, pos.z) < GROUND_R - 2 ? pos : new pc.Vec3(0, 0, GROUND_R - 6);
      this.walkPos.set(inside.x, 0, inside.z);
      this.walkYaw = this.orbitYawCur + 180;
      this.walkPitch = -4;
    }
    this.mode = mode;
    this.draggingObject = false;
  }

  setJoystick(x: number, y: number): void {
    this.joy.x = x;
    this.joy.y = y;
  }

  // ── Objects ──────────────────────────────────────────────────────────────

  get count(): number {
    return this.objects.filter((o) => o.removeT === null).length;
  }

  get isFull(): boolean {
    return this.count >= MAX_OBJECTS;
  }

  selectedCategory(): string | null {
    const o = this.selected();
    return o ? o.category : null;
  }

  private selected(): WorldObject | null {
    return this.objects.find((o) => o.id === this.selectedId) ?? null;
  }

  /** Spawn at an explicit spot, or in front of the current view. */
  spawn(
    category: string,
    opts: { x?: number; z?: number; yaw?: number; s?: number; animate?: boolean; select?: boolean } = {},
  ): boolean {
    const def = MODELS[category];
    if (!def || !this.app || this.isFull) return false;

    let { x, z } = opts;
    if (x === undefined || z === undefined) {
      const spot = this.spawnSpot();
      x = spot.x;
      z = spot.z;
    }
    const clamped = this.clampToGround(x, z);

    const ent = def.build();
    const yaw = opts.yaw ?? this.facingCameraYaw(clamped.x, clamped.z);
    const scale = opts.s ?? 1;
    const baseY = def.float ?? 0;
    ent.setLocalPosition(clamped.x, baseY, clamped.z);
    ent.setLocalEulerAngles(0, yaw, 0);
    const animate = opts.animate !== false;
    ent.setLocalScale(animate ? 0.02 : scale, animate ? 0.02 : scale, animate ? 0.02 : scale);
    this.app.root.addChild(ent);

    const obj: WorldObject = {
      id: this.nextId++,
      category,
      def,
      ent,
      scale: animate ? 0.02 : scale,
      targetScale: scale,
      yaw,
      targetYaw: yaw,
      x: clamped.x,
      z: clamped.z,
      baseY,
      bobPhase: Math.random() * Math.PI * 2,
      spawnT: animate ? 0 : 1,
      removeT: null,
    };
    this.objects.push(obj);
    if (opts.select !== false) this.select(obj.id);
    this.events.onCountChange?.(this.count);
    return true;
  }

  /** A free-ish spot in front of the camera on the ground plane. */
  private spawnSpot(): { x: number; z: number } {
    const hit = this.groundHit(this.canvas.clientWidth / 2, this.canvas.clientHeight * 0.45);
    const base = hit ?? new pc.Vec3(0, 0, 0);
    // Nudge in a small spiral until we're not on top of someone
    for (let i = 0; i < 10; i++) {
      const a = i * 2.4;
      const r = i * 0.55;
      const x = base.x + Math.cos(a) * r;
      const z = base.z + Math.sin(a) * r;
      const crowded = this.objects.some(
        (o) => o.removeT === null && Math.hypot(o.x - x, o.z - z) < 1.1,
      );
      if (!crowded) return { x, z };
    }
    return { x: base.x, z: base.z };
  }

  private facingCameraYaw(x: number, z: number): number {
    const cam = this.camera.getPosition();
    return (Math.atan2(cam.x - x, cam.z - z) * 180) / Math.PI;
  }

  private clampToGround(x: number, z: number): { x: number; z: number } {
    const r = Math.hypot(x, z);
    const max = GROUND_R - 1.2;
    if (r <= max) return { x, z };
    return { x: (x / r) * max, z: (z / r) * max };
  }

  select(id: number | null): void {
    this.selectedId = id;
    const o = this.selected();
    this.ring.enabled = !!o;
    this.events.onSelect?.(o ? o.category : null);
  }

  rotateSelected(): void {
    const o = this.selected();
    if (o) o.targetYaw += 45;
  }

  scaleSelected(dir: 1 | -1): void {
    const o = this.selected();
    if (!o) return;
    o.targetScale = pc.math.clamp(o.targetScale * (dir > 0 ? 1.25 : 0.8), 0.45, 2.6);
  }

  duplicateSelected(): boolean {
    const o = this.selected();
    if (!o || this.isFull) return false;
    const a = Math.random() * Math.PI * 2;
    return this.spawn(o.category, {
      x: o.x + Math.cos(a) * 1.4,
      z: o.z + Math.sin(a) * 1.4,
      yaw: o.yaw,
      s: o.targetScale,
    });
  }

  removeSelected(): void {
    const o = this.selected();
    if (!o) return;
    o.removeT = 0;
    this.select(null);
  }

  clearAll(): void {
    for (const o of this.objects) o.ent.destroy();
    this.objects = [];
    this.select(null);
    this.events.onCountChange?.(0);
  }

  // ── Serialization ────────────────────────────────────────────────────────

  toJSON(): WorldSave {
    return {
      v: 1,
      theme: this.theme,
      objects: this.objects
        .filter((o) => o.removeT === null)
        .map((o) => ({
          c: o.category,
          x: Math.round(o.x * 100) / 100,
          z: Math.round(o.z * 100) / 100,
          yaw: Math.round(o.yaw),
          s: Math.round(o.targetScale * 100) / 100,
        })),
    };
  }

  load(save: WorldSave): void {
    this.clearAll();
    this.setTheme(save.theme in THEMES ? save.theme : 'day');
    for (const o of (save.objects ?? []).slice(0, MAX_OBJECTS)) {
      if (!MODELS[o.c]) continue;
      this.spawn(o.c, { x: o.x, z: o.z, yaw: o.yaw, s: o.s, animate: false, select: false });
    }
    this.select(null);
  }

  photo(): string | null {
    try {
      return this.canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  // ── Picking ──────────────────────────────────────────────────────────────

  private makeRay(sx: number, sy: number): pc.Ray {
    const cam = this.camera.camera!;
    const near = cam.screenToWorld(sx, sy, cam.nearClip);
    const far = cam.screenToWorld(sx, sy, cam.farClip);
    const dir = new pc.Vec3().sub2(far, near).normalize();
    return new pc.Ray(near, dir);
  }

  private groundHit(sx: number, sy: number, planeY = 0): pc.Vec3 | null {
    const ray = this.makeRay(sx, sy);
    if (Math.abs(ray.direction.y) < 1e-5) return null;
    const t = (planeY - ray.origin.y) / ray.direction.y;
    if (t < 0) return null;
    return new pc.Vec3(
      ray.origin.x + ray.direction.x * t,
      planeY,
      ray.origin.z + ray.direction.z * t,
    );
  }

  private pick(sx: number, sy: number): WorldObject | null {
    const ray = this.makeRay(sx, sy);
    const camPos = this.camera.getPosition();
    let best: WorldObject | null = null;
    let bestDist = Infinity;
    const sphere = new pc.BoundingSphere();
    for (const o of this.objects) {
      if (o.removeT !== null) continue;
      const y = o.baseY + (o.def.h * o.scale) / 2;
      sphere.center.set(o.x, y, o.z);
      sphere.radius = Math.max(o.def.r * o.scale, 0.55);
      if (sphere.intersectsRay(ray)) {
        const d = camPos.distance(sphere.center);
        if (d < bestDist) {
          bestDist = d;
          best = o;
        }
      }
    }
    return best;
  }

  // ── Input ────────────────────────────────────────────────────────────────

  private bindInput(): void {
    const el = this.canvas;
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('pointercancel', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private unbindInput(): void {
    const el = this.canvas;
    el.removeEventListener('pointerdown', this.onPointerDown);
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('pointerup', this.onPointerUp);
    el.removeEventListener('pointercancel', this.onPointerUp);
    el.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private local(e: PointerEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onPointerDown = (e: PointerEvent): void => {
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic events */
    }
    const p = this.local(e);
    this.pointers.set(e.pointerId, { x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false });

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      this.draggingObject = false;
    } else if (this.pointers.size === 1 && this.mode === 'orbit') {
      // Start dragging only when grabbing the already-selected object
      const hit = this.pick(p.x, p.y);
      this.draggingObject = !!hit && hit.id === this.selectedId;
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    const state = this.pointers.get(e.pointerId);
    if (!state) return;
    const p = this.local(e);
    const dx = p.x - state.x;
    const dy = p.y - state.y;
    if (Math.hypot(p.x - state.sx, p.y - state.sy) > TAP_SLOP_PX) state.moved = true;
    state.x = p.x;
    state.y = p.y;

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinchDist > 0) {
        this.orbitDist = pc.math.clamp(this.orbitDist * (this.pinchDist / d), 5, 34);
      }
      this.pinchDist = d;
      return;
    }

    if (this.draggingObject) {
      const o = this.selected();
      if (o) {
        const hit = this.groundHit(p.x, p.y, o.baseY);
        if (hit) {
          const c = this.clampToGround(hit.x, hit.z);
          o.x = c.x;
          o.z = c.z;
        }
      }
      return;
    }

    if (this.mode === 'orbit') {
      this.orbitYaw -= dx * 0.35;
      this.orbitPitch = pc.math.clamp(this.orbitPitch + dy * 0.25, 8, 75);
    } else {
      this.walkYaw -= dx * 0.3;
      this.walkPitch = pc.math.clamp(this.walkPitch - dy * 0.22, -55, 55);
    }
  };

  private onPointerUp = (e: PointerEvent): void => {
    const state = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    this.pinchDist = 0;
    const wasDragging = this.draggingObject;
    if (this.pointers.size === 0) this.draggingObject = false;
    if (!state || state.moved || wasDragging) return;

    // Tap: select / deselect
    const hit = this.pick(state.x, state.y);
    if (hit) this.select(hit.id === this.selectedId ? null : hit.id);
    else this.select(null);
  };

  private onWheel = (e: WheelEvent): void => {
    if (this.mode !== 'orbit') return;
    e.preventDefault();
    this.orbitDist = pc.math.clamp(this.orbitDist * (e.deltaY > 0 ? 1.1 : 0.9), 5, 34);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key.toLowerCase());
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase());
  };

  // ── Frame update ─────────────────────────────────────────────────────────

  private update(dt: number): void {
    this.time += dt;

    // Object animations
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];

      if (o.removeT !== null) {
        o.removeT += dt / 0.28;
        const k = Math.max(0, 1 - o.removeT);
        o.ent.setLocalScale(o.scale * k, o.scale * k, o.scale * k);
        if (o.removeT >= 1) {
          o.ent.destroy();
          this.objects.splice(i, 1);
          this.events.onCountChange?.(this.count);
        }
        continue;
      }

      if (o.spawnT < 1) {
        o.spawnT = Math.min(1, o.spawnT + dt / 0.45);
        const t = o.spawnT;
        // ease-out-back overshoot
        const k = 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
        o.scale = Math.max(0.02, o.targetScale * k);
      } else {
        o.scale += (o.targetScale - o.scale) * Math.min(1, dt * 10);
      }
      o.yaw += (o.targetYaw - o.yaw) * Math.min(1, dt * 12);

      const bob = o.def.float ? Math.sin(this.time * 1.25 + o.bobPhase) * 0.14 : 0;
      o.ent.setLocalPosition(o.x, o.baseY + bob, o.z);
      o.ent.setLocalEulerAngles(0, o.yaw, 0);
      o.ent.setLocalScale(o.scale, o.scale, o.scale);
    }

    // Selection ring follows its object
    const sel = this.selected();
    if (sel) {
      const r = Math.max(sel.def.r * sel.scale, 0.6) * 2.4;
      const pulse = 1 + Math.sin(this.time * 5) * 0.06;
      this.ring.enabled = true;
      // Always a ground spotlight — even for floating objects
      this.ring.setLocalPosition(sel.x, 0.06, sel.z);
      this.ring.setLocalScale(r * pulse, 0.35, r * pulse);
      this.ring.setLocalEulerAngles(0, this.time * 40, 0);
    } else {
      this.ring.enabled = false;
    }

    // Camera
    if (this.mode === 'orbit') {
      const ease = 1 - Math.exp(-dt * 9);
      this.orbitYawCur += (this.orbitYaw - this.orbitYawCur) * ease;
      this.orbitPitchCur += (this.orbitPitch - this.orbitPitchCur) * ease;
      this.orbitDistCur += (this.orbitDist - this.orbitDistCur) * ease;

      const yawR = (this.orbitYawCur * Math.PI) / 180;
      const pitchR = (this.orbitPitchCur * Math.PI) / 180;
      const cy = Math.cos(pitchR) * this.orbitDistCur;
      const pos = new pc.Vec3(
        this.orbitTarget.x + Math.sin(yawR) * cy,
        this.orbitTarget.y + Math.sin(pitchR) * this.orbitDistCur,
        this.orbitTarget.z + Math.cos(yawR) * cy,
      );
      this.camera.setPosition(pos);
      this.camera.lookAt(this.orbitTarget);
    } else {
      // Keyboard fallback for desktop walkers
      let kx = 0;
      let ky = 0;
      if (this.keys.has('w') || this.keys.has('arrowup')) ky += 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) ky -= 1;
      if (this.keys.has('a') || this.keys.has('arrowleft')) kx -= 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) kx += 1;

      const jx = pc.math.clamp(this.joy.x + kx, -1, 1);
      const jy = pc.math.clamp(this.joy.y + ky, -1, 1);
      const yawR = (this.walkYaw * Math.PI) / 180;
      const speed = 4.2;
      const fx = Math.sin(yawR) * -1;
      const fz = Math.cos(yawR) * -1;
      const rx = Math.cos(yawR);
      const rz = -Math.sin(yawR);
      this.walkPos.x += (fx * jy + rx * jx) * speed * dt;
      this.walkPos.z += (fz * jy + rz * jx) * speed * dt;
      const r = Math.hypot(this.walkPos.x, this.walkPos.z);
      const maxR = GROUND_R - 1.5;
      if (r > maxR) {
        this.walkPos.x = (this.walkPos.x / r) * maxR;
        this.walkPos.z = (this.walkPos.z / r) * maxR;
      }
      this.camera.setPosition(this.walkPos.x, 1.55, this.walkPos.z);
      this.camera.setEulerAngles(this.walkPitch, this.walkYaw, 0);
    }
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.unbindInput();
    this.app?.destroy();
    this.app = null;
    clearMaterialCache();
  }
}
