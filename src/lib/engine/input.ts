/**
 * Unified pointer input handler for mouse + touch events.
 */
export interface PointerPoint {
  x: number;
  y: number;
}

export type PointerCallback = (point: PointerPoint) => void;

export class InputHandler {
  private el: HTMLElement;
  private onDown?: PointerCallback;
  private onMove?: PointerCallback;
  private onUp?: PointerCallback;

  constructor(el: HTMLElement) {
    this.el = el;
    this._handleDown = this._handleDown.bind(this);
    this._handleMove = this._handleMove.bind(this);
    this._handleUp = this._handleUp.bind(this);

    el.addEventListener('pointerdown', this._handleDown);
    el.addEventListener('pointermove', this._handleMove);
    el.addEventListener('pointerup', this._handleUp);
    el.addEventListener('pointercancel', this._handleUp);
  }

  on(event: 'down' | 'move' | 'up', cb: PointerCallback): this {
    if (event === 'down') this.onDown = cb;
    else if (event === 'move') this.onMove = cb;
    else if (event === 'up') this.onUp = cb;
    return this;
  }

  destroy(): void {
    const { el } = this;
    el.removeEventListener('pointerdown', this._handleDown);
    el.removeEventListener('pointermove', this._handleMove);
    el.removeEventListener('pointerup', this._handleUp);
    el.removeEventListener('pointercancel', this._handleUp);
  }

  private _getPoint(e: PointerEvent): PointerPoint {
    const rect = this.el.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private _handleDown(e: PointerEvent): void {
    e.preventDefault();
    this.onDown?.call(null, this._getPoint(e));
  }

  private _handleMove(e: PointerEvent): void {
    e.preventDefault();
    this.onMove?.call(null, this._getPoint(e));
  }

  private _handleUp(e: PointerEvent): void {
    e.preventDefault();
    this.onUp?.call(null, this._getPoint(e));
  }
}
