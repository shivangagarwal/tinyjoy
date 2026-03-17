/**
 * Canvas rendering abstraction with DPR support.
 */
export class GameCanvas {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private dpr: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  }

  /** Resize canvas to match its CSS display size × DPR. */
  resize(): void {
    const { canvas, ctx, dpr } = this;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  }

  get width(): number {
    return this.canvas.clientWidth;
  }

  get height(): number {
    return this.canvas.clientHeight;
  }

  clear(color = '#ffffff'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  fillRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  strokeRect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    lineWidth = 1,
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(x, y, w, h);
  }

  fillRoundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    color: string,
  ): void {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  }

  fillCircle(cx: number, cy: number, r: number, color: string): void {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  fillText(
    text: string,
    x: number,
    y: number,
    color: string,
    font = '16px system-ui',
    align: CanvasTextAlign = 'left',
    baseline: CanvasTextBaseline = 'alphabetic',
  ): void {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
  }

  measureText(text: string, font = '16px system-ui'): TextMetrics {
    this.ctx.font = font;
    return this.ctx.measureText(text);
  }
}
