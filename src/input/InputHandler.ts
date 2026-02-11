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
  private boundHandlePointer: (e: PointerEvent) => void;
  private boundHandleKey: (e: KeyboardEvent) => void;

  constructor() {
    this.boundHandlePointer = this.handlePointer.bind(this);
    this.boundHandleKey = this.handleKey.bind(this);
  }

  initialize(_container: HTMLElement): void {
    // タッチ・マウスを統一的に処理する pointerdown をドキュメント全体に登録
    document.addEventListener('pointerdown', this.boundHandlePointer);
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
    document.removeEventListener('pointerdown', this.boundHandlePointer);
    document.removeEventListener('keydown', this.boundHandleKey);
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

  private handlePointer(e: PointerEvent): void {
    if (!this.isEnabled) return;
    const screenWidth = window.innerWidth;
    if (screenWidth <= 0) return;
    const direction = this.resolveTouchDirection(e.clientX, screenWidth);
    this.processInput(direction);
  }

  private handleKey(e: KeyboardEvent): void {
    const direction = this.resolveKeyDirection(e.key);
    if (direction) {
      this.processInput(direction);
    }
  }
}
