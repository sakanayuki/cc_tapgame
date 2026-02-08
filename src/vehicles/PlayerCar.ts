import type { Vector3 } from '../types/index.ts';
import type { Road } from '../map/Road.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';

export class PlayerCar {
  private position: Vector3 = { x: 0, y: 0, z: 0 };
  private rotation: number = 0;
  private currentRoadId: string = '';
  private currentProgress: number = 0;
  private targetIntersectionId: string = '';
  private isSpinning: boolean = false;
  private spinElapsed: number = 0;
  private zRotation: number = 0;

  reset(startRoadId: string, startProgress: number, startIntersectionId: string): void {
    this.currentRoadId = startRoadId;
    this.currentProgress = startProgress;
    this.targetIntersectionId = startIntersectionId;
    this.isSpinning = false;
    this.spinElapsed = 0;
    this.zRotation = 0;
  }

  update(deltaTime: number, road: Road): void {
    if (this.isSpinning) {
      this.spinElapsed += deltaTime;
      const ratio = Math.min(this.spinElapsed / GAME_CONFIG.SPIN_DURATION_SEC, 1);
      this.zRotation = ratio * Math.PI * 2;
      if (this.spinElapsed >= GAME_CONFIG.SPIN_DURATION_SEC) {
        this.isSpinning = false;
        this.spinElapsed = 0;
        this.zRotation = 0;
      }
      return;
    }

    const speedPerSec = GAME_CONFIG.VEHICLE_SPEED / road.length;
    this.currentProgress += speedPerSec * deltaTime;
    this.currentProgress = Math.min(this.currentProgress, 1.0);

    this.position = road.getPositionAtProgress(this.currentProgress);
    const dir = road.getDirectionAtProgress(this.currentProgress);
    this.rotation = Math.atan2(dir.x, dir.z);
  }

  startSpin(): void {
    this.isSpinning = true;
    this.spinElapsed = 0;
    this.zRotation = 0;
  }

  getIsSpinning(): boolean {
    return this.isSpinning;
  }

  getCurrentRoadId(): string {
    return this.currentRoadId;
  }

  getCurrentProgress(): number {
    return this.currentProgress;
  }

  getTargetIntersectionId(): string {
    return this.targetIntersectionId;
  }

  getPosition(): Vector3 {
    return { ...this.position };
  }

  getRotation(): number {
    return this.rotation;
  }

  getZRotation(): number {
    return this.zRotation;
  }

  enterRoad(roadId: string, targetIntersectionId: string): void {
    this.currentRoadId = roadId;
    this.currentProgress = 0;
    this.targetIntersectionId = targetIntersectionId;
  }

  hasReachedIntersection(): boolean {
    return this.currentProgress >= 1.0;
  }
}
