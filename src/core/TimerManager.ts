import { GAME_CONFIG } from '../config/gameConfig.ts';

export class TimerManager {
  private remainingTime: number = GAME_CONFIG.GAME_DURATION_SEC;
  private isRunning: boolean = false;
  private onTimeUp: (() => void) | null = null;
  private hasFireTimeUp: boolean = false;

  reset(): void {
    this.remainingTime = GAME_CONFIG.GAME_DURATION_SEC;
    this.isRunning = false;
    this.hasFireTimeUp = false;
  }

  start(): void {
    this.isRunning = true;
  }

  stop(): void {
    this.isRunning = false;
  }

  update(deltaTime: number): void {
    if (!this.isRunning) return;

    const clampedDelta = Math.min(Math.max(deltaTime, 0), GAME_CONFIG.MAX_DELTA_TIME);
    this.remainingTime -= clampedDelta;

    if (this.remainingTime <= 0) {
      this.remainingTime = 0;
      this.isRunning = false;

      if (!this.hasFireTimeUp && this.onTimeUp) {
        this.hasFireTimeUp = true;
        this.onTimeUp();
      }
    }
  }

  getRemainingTime(): number {
    return this.remainingTime;
  }

  getDisplayTime(): string {
    const totalSeconds = Math.ceil(this.remainingTime);
    const clamped = Math.max(totalSeconds, 0);
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  setOnTimeUp(callback: () => void): void {
    this.onTimeUp = callback;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}
