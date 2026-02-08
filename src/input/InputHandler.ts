import type { Direction, PlayerInput } from '../types/index.ts';

const KEY_MAP: Record<string, Direction> = {
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowUp: 'straight',
  w: 'straight',
  W: 'straight',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
};

export class InputHandler {
  private isEnabled: boolean = true;
  private lastInput: PlayerInput | null = null;
  private onDirectionInput: ((input: PlayerInput) => void) | null = null;
  private container: HTMLElement | null = null;
  private boundHandleTouch: (e: TouchEvent) => void;
  private boundHandleClick: (e: MouseEvent) => void;
  private boundHandleKey: (e: KeyboardEvent) => void;

  constructor() {
    this.boundHandleTouch = this.handleTouch.bind(this);
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleKey = this.handleKey.bind(this);
  }

  initialize(container: HTMLElement): void {
    this.container = container;
    container.addEventListener('touchstart', this.boundHandleTouch, { passive: true });
    container.addEventListener('click', this.boundHandleClick);
    document.addEventListener('keydown', this.boundHandleKey);
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  clearLastInput(): void {
    this.lastInput = null;
  }

  getLastInput(): PlayerInput | null {
    return this.lastInput;
  }

  setOnDirectionInput(callback: (input: PlayerInput) => void): void {
    this.onDirectionInput = callback;
  }

  resolveTouchDirection(touchX: number, screenWidth: number): Direction {
    if (screenWidth <= 0) {
      throw new Error(`screenWidth must be positive, got ${screenWidth}`);
    }
    if (touchX < 0) return 'left';
    if (touchX >= screenWidth) return 'right';
    if (touchX < screenWidth / 3) return 'left';
    if (touchX < (screenWidth * 2) / 3) return 'straight';
    return 'right';
  }

  resolveKeyDirection(key: string): Direction | null {
    return KEY_MAP[key] ?? null;
  }

  dispose(): void {
    if (this.container) {
      this.container.removeEventListener('touchstart', this.boundHandleTouch);
      this.container.removeEventListener('click', this.boundHandleClick);
    }
    document.removeEventListener('keydown', this.boundHandleKey);
    this.container = null;
  }

  private processInput(direction: Direction): void {
    if (!this.isEnabled) return;

    const input: PlayerInput = {
      direction,
      timestamp: performance.now() / 1000,
    };
    this.lastInput = input;
    this.onDirectionInput?.(input);
  }

  private handleTouch(e: TouchEvent): void {
    if (!this.isEnabled || !this.container) return;
    const touch = e.touches[0];
    if (!touch) return;
    const direction = this.resolveTouchDirection(touch.clientX, this.container.clientWidth);
    this.processInput(direction);
  }

  private handleClick(e: MouseEvent): void {
    if (!this.isEnabled || !this.container) return;
    const direction = this.resolveTouchDirection(e.clientX, this.container.clientWidth);
    this.processInput(direction);
  }

  private handleKey(e: KeyboardEvent): void {
    const direction = this.resolveKeyDirection(e.key);
    if (direction) {
      this.processInput(direction);
    }
  }
}
