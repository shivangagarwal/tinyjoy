/**
 * Client-side sketch recognizer wrapping DoodleNet (MIT, ml5.js) — a TF.js CNN
 * trained on Google's QuickDraw dataset. See public/models/doodlenet/README.md.
 *
 * Everything runs in the browser: the model is served statically from
 * /models/doodlenet/ and no drawing data leaves the device.
 */
import { DOODLE_CATEGORIES, type DoodleCategory } from './categories';

// Preprocessing mirrors ml5.js DoodleNet inference: invert (ink=1, paper=0),
// bilinear resize to 28×28, grayscale, binarize via floor.
const MODEL_URL = '/models/doodlenet/model.json';
const CLASSES_URL = '/models/doodlenet/class_names.txt';
const INPUT_SIZE = 28;

type Tf = typeof import('@tensorflow/tfjs');
type LayersModel = import('@tensorflow/tfjs').LayersModel;

export interface Guess extends DoodleCategory {
  /** Probability renormalized over the kid-friendly category subset, 0..1 */
  prob: number;
}

export class DoodleRecognizer {
  private tf: Tf | null = null;
  private model: LayersModel | null = null;
  /** Model output index for each entry of DOODLE_CATEGORIES */
  private indices: number[] = [];

  get isReady(): boolean {
    return this.model !== null;
  }

  async load(): Promise<void> {
    if (this.model) return;

    const [tf, classesRes] = await Promise.all([
      import('@tensorflow/tfjs'),
      fetch(CLASSES_URL),
    ]);
    const classNames = (await classesRes.text())
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    this.tf = tf;
    this.model = await tf.loadLayersModel(MODEL_URL);

    this.indices = DOODLE_CATEGORIES.map((c) => {
      const idx = classNames.indexOf(c.id);
      if (idx === -1) console.warn(`DoodleRecognizer: unknown category "${c.id}"`);
      return idx;
    });

    // Warm up so the first real guess is instant
    const warmup = this.model.predict(
      tf.zeros([1, INPUT_SIZE, INPUT_SIZE, 1]),
    ) as import('@tensorflow/tfjs').Tensor;
    await warmup.data();
    warmup.dispose();
  }

  /** Top-k guesses for the drawing, restricted to DOODLE_CATEGORIES. */
  async guess(canvas: HTMLCanvasElement, topK = 3): Promise<Guess[]> {
    const { tf, model } = this;
    if (!tf || !model) return [];

    const logits = tf.tidy(() => {
      const img = tf.browser.fromPixels(canvas).toFloat();
      const inverted = tf.scalar(1).sub(img.div(255)) as import('@tensorflow/tfjs').Tensor3D;
      const resized = tf.image.resizeBilinear(inverted, [INPUT_SIZE, INPUT_SIZE]);
      const gray = resized.mean(2).floor();
      const batched = gray.reshape([1, INPUT_SIZE, INPUT_SIZE, 1]);
      return model.predict(batched) as import('@tensorflow/tfjs').Tensor;
    });
    const probs = (await logits.data()) as Float32Array;
    logits.dispose();

    const subset = DOODLE_CATEGORIES.map((cat, i) => ({
      ...cat,
      raw: this.indices[i] >= 0 ? probs[this.indices[i]] : 0,
    }));
    const total = subset.reduce((sum, s) => sum + s.raw, 0) || 1;

    return subset
      .sort((a, b) => b.raw - a.raw)
      .slice(0, topK)
      .map(({ raw, ...cat }) => ({ ...cat, prob: raw / total }));
  }

  dispose(): void {
    this.model?.dispose();
    this.model = null;
    this.tf = null;
  }
}
