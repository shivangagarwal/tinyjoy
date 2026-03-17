/**
 * Simple finite state machine for game screens.
 */
export type GameState = 'menu' | 'playing' | 'paused' | 'game-over';

export interface StateHooks<S extends string> {
  onEnter?: (state: S, prev: S | null) => void;
  onExit?: (state: S, next: S) => void;
}

export class StateMachine<S extends string = GameState> {
  private _current: S | null = null;
  private hooks: Map<S, StateHooks<S>> = new Map();
  private listeners: Array<(state: S, prev: S | null) => void> = [];

  get current(): S | null {
    return this._current;
  }

  is(state: S): boolean {
    return this._current === state;
  }

  /** Register enter/exit hooks for a state. */
  configure(state: S, hooks: StateHooks<S>): this {
    this.hooks.set(state, hooks);
    return this;
  }

  /** Subscribe to all state changes. */
  onChange(cb: (state: S, prev: S | null) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  transition(next: S): void {
    const prev = this._current;
    if (prev === next) return;

    if (prev !== null) {
      this.hooks.get(prev)?.onExit?.(prev, next);
    }

    this._current = next;
    this.hooks.get(next)?.onEnter?.(next, prev);
    this.listeners.forEach((l) => l(next, prev));
  }
}
