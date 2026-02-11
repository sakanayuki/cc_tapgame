import type { Vector3, Direction } from '../types/index.ts';
import type { Road } from '../map/Road.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';

export class NpcBuggy {
  private position: Vector3 = { x: 0, y: 0, z: 0 };
  private rotation: number = 0;
  private currentRoadId: string = '';
  private currentProgress: number = 0;
  private progressDirection: 1 | -1 = 1;
  private targetIntersectionId: string = '';
  private chosenDirection: Direction | null = null;

  reset(startRoadId: string, startProgress: number, startIntersectionId: string): void {
    this.currentRoadId = startRoadId;
    this.currentProgress = startProgress;
    this.targetIntersectionId = startIntersectionId;
    this.progressDirection = 1;
    this.chosenDirection = null;
  }

  update(deltaTime: number, road: Road): void {
    const speedPerSec = GAME_CONFIG.VEHICLE_SPEED / road.length;
    this.currentProgress += this.progressDirection * speedPerSec * deltaTime;

    if (this.progressDirection > 0) {
      this.currentProgress = Math.min(this.currentProgress, 1.0);
    } else {
      this.currentProgress = Math.max(this.currentProgress, 0.0);
    }

    this.position = road.getPositionAtProgress(this.currentProgress);
    const dir = road.getDirectionAtProgress(this.currentProgress);
    const sign = this.progressDirection;
    this.rotation = Math.atan2(dir.x * sign, dir.z * sign);
  }

  decideDirection(availableDirections: Direction[]): Direction {
    if (availableDirections.length === 0) {
      throw new Error('availableDirections must not be empty');
    }
    const index = Math.floor(Math.random() * availableDirections.length);
    this.chosenDirection = availableDirections[index];
    return this.chosenDirection;
  }

  getChosenDirection(): Direction | null {
    return this.chosenDirection;
  }

  getPosition(): Vector3 {
    return { ...this.position };
  }

  getRotation(): number {
    return this.rotation;
  }

  getCurrentRoadId(): string {
    return this.currentRoadId;
  }

  getCurrentProgress(): number {
    return this.currentProgress;
  }

  getProgressDirection(): 1 | -1 {
    return this.progressDirection;
  }

  getTargetIntersectionId(): string {
    return this.targetIntersectionId;
  }

  enterRoad(road: Road, targetIntersectionId: string): void {
    this.currentRoadId = road.id;
    this.targetIntersectionId = targetIntersectionId;
    this.chosenDirection = null;

    if (targetIntersectionId === road.endIntersectionId) {
      this.currentProgress = 0;
      this.progressDirection = 1;
    } else {
      this.currentProgress = 1;
      this.progressDirection = -1;
    }
  }

  hasReachedIntersection(): boolean {
    if (this.progressDirection > 0) {
      return this.currentProgress >= 1.0;
    }
    return this.currentProgress <= 0.0;
  }
}
