/**
 * Model registry: QuickDraw category id → procedural builder + placement
 * metadata. Every entry of DOODLE_CATEGORIES must appear here — a dev-time
 * check in world.ts warns if one is missing.
 *
 * h = approx model height, r = pick-sphere radius (both in world units,
 * pre-scale). float = hover height for sky things (0/absent = grounded).
 */
import * as pc from 'playcanvas';
import * as nature from './nature';
import * as creatures from './creatures';
import * as food from './food';
import * as things from './things';
import * as vehicles from './vehicles';
import * as land from './land';

export interface ModelDef {
  build: () => pc.Entity;
  h: number;
  r: number;
  float?: number;
}

export const MODELS: Record<string, ModelDef> = {
  // Nature & sky
  sun: { build: nature.sun, h: 2.0, r: 1.15, float: 2.6 },
  moon: { build: nature.moon, h: 1.0, r: 0.6, float: 2.6 },
  star: { build: nature.star, h: 1.4, r: 0.8, float: 2.3 },
  cloud: { build: nature.cloud, h: 1.1, r: 0.95, float: 2.1 },
  rainbow: { build: nature.rainbow, h: 1.7, r: 1.7 },
  tree: { build: nature.tree, h: 2.3, r: 1.0 },
  leaf: { build: nature.leaf, h: 0.6, r: 0.7 },
  flower: { build: nature.flower, h: 1.4, r: 0.6 },
  mountain: { build: nature.mountain, h: 1.7, r: 1.5 },
  snowman: { build: nature.snowman, h: 2.3, r: 0.75 },
  // Creatures
  cat: { build: creatures.cat, h: 1.25, r: 0.65 },
  dog: { build: creatures.dog, h: 1.3, r: 0.7 },
  bird: { build: creatures.bird, h: 1.2, r: 0.55 },
  duck: { build: creatures.duck, h: 1.05, r: 0.6 },
  elephant: { build: creatures.elephant, h: 1.5, r: 1.05 },
  mouse: { build: creatures.mouse, h: 0.8, r: 0.5 },
  snake: { build: creatures.snake, h: 0.5, r: 1.1 },
  spider: { build: creatures.spider, h: 0.8, r: 0.85 },
  bee: { build: creatures.bee, h: 0.75, r: 0.6, float: 1.5 },
  butterfly: { build: creatures.butterfly, h: 0.4, r: 0.75, float: 1.6 },
  bear: { build: creatures.bear, h: 1.8, r: 0.85 },
  fish: { build: creatures.fish, h: 0.9, r: 0.7, float: 0.9 },
  // Food
  apple: { build: food.apple, h: 1.0, r: 0.55 },
  banana: { build: food.banana, h: 0.75, r: 0.75 },
  cake: { build: food.cake, h: 1.1, r: 0.7 },
  cookie: { build: food.cookie, h: 0.25, r: 0.6 },
  donut: { build: food.donut, h: 0.45, r: 0.8 },
  ice_cream: { build: food.ice_cream, h: 1.45, r: 0.5 },
  pizza: { build: food.pizza, h: 0.2, r: 0.7 },
  carrot: { build: food.carrot, h: 0.55, r: 0.75 },
  // Things
  house: { build: things.house, h: 1.6, r: 1.0 },
  door: { build: things.door, h: 1.6, r: 0.6 },
  chair: { build: things.chair, h: 1.45, r: 0.6 },
  book: { build: things.book, h: 0.3, r: 0.8 },
  candle: { build: things.candle, h: 1.35, r: 0.45 },
  clock: { build: things.clock, h: 1.8, r: 0.7 },
  cup: { build: things.cup, h: 0.8, r: 0.55 },
  spoon: { build: things.spoon, h: 0.3, r: 0.65 },
  key: { build: things.key, h: 0.3, r: 0.75 },
  umbrella: { build: things.umbrella, h: 1.7, r: 0.9 },
  hat: { build: things.hat, h: 0.9, r: 0.65 },
  crown: { build: things.crown, h: 0.8, r: 0.6 },
  shoe: { build: things.shoe, h: 0.6, r: 0.7 },
  eye: { build: things.eye, h: 1.0, r: 0.6 },
  smiley_face: { build: things.smiley_face, h: 1.4, r: 0.7 },
  // Vehicles
  car: { build: vehicles.car, h: 1.0, r: 1.0 },
  bus: { build: vehicles.bus, h: 1.25, r: 1.25 },
  airplane: { build: vehicles.airplane, h: 1.3, r: 1.3, float: 1.9 },
  bicycle: { build: vehicles.bicycle, h: 1.3, r: 0.85 },
  sailboat: { build: vehicles.sailboat, h: 2.1, r: 1.0 },
  // Land tiles
  river: { build: land.river, h: 0.15, r: 1.2 },
  pond: { build: land.pond, h: 0.15, r: 1.0 },
  bridge: { build: land.bridge, h: 0.9, r: 1.15 },
  fence: { build: land.fence, h: 0.9, r: 1.1 },
  grass: { build: land.grass, h: 0.55, r: 0.55 },
  road: { build: land.road, h: 0.12, r: 1.25 },
};

export function buildModel(categoryId: string): pc.Entity | null {
  const def = MODELS[categoryId];
  return def ? def.build() : null;
}
