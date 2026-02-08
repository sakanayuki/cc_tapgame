import type { Direction, PlayerInput, JudgeResult } from '../types/index.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';

export class IntersectionJudge {
  private isApproaching: boolean = false;
  private timeToIntersection: number = Infinity;
  private isInputLocked: boolean = false;
  private availableDirections: Direction[] = [];

  update(distanceToIntersection: number, speed: number): void {
    if (speed <= 0) return;

    this.timeToIntersection = Math.max(distanceToIntersection, 0) / speed;
    this.isApproaching = this.timeToIntersection <= GAME_CONFIG.DIRECTION_SHOW_SEC;
    this.isInputLocked = this.timeToIntersection <= GAME_CONFIG.INPUT_DEADLINE_SEC;
  }

  getIsApproaching(): boolean {
    return this.isApproaching;
  }

  getIsInputLocked(): boolean {
    return this.isInputLocked;
  }

  getTimeToIntersection(): number {
    return this.timeToIntersection;
  }

  getAvailableDirections(): Direction[] {
    return [...this.availableDirections];
  }

  setAvailableDirections(directions: Direction[]): void {
    this.availableDirections = [...directions];
  }

  judge(
    playerInput: PlayerInput | null,
    npcDirection: Direction,
    intersectionId: string,
  ): JudgeResult {
    let playerDirection: Direction;

    if (playerInput === null) {
      playerDirection = 'straight';
    } else {
      playerDirection = playerInput.direction;
    }

    let isCorrect: boolean;
    if (
      playerDirection === 'straight' &&
      !this.availableDirections.includes('straight')
    ) {
      // T字路で直進不可 → 不正解
      isCorrect = false;
    } else {
      isCorrect = playerDirection === npcDirection;
    }

    return {
      isCorrect,
      playerDirection,
      correctDirection: npcDirection,
      intersectionId,
    };
  }

  resetState(): void {
    this.isApproaching = false;
    this.isInputLocked = false;
    this.timeToIntersection = Infinity;
    this.availableDirections = [];
  }
}
