import type { Vector3 } from '../types/index.ts';
import type { Road } from '../map/Road.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';

export class PlayerCar {
  private position: Vector3 = { x: 0, y: 0, z: 0 };
  private rotation: number = 0;
  private currentRoadId: string = '';
  private currentProgress: number = 0;
  private progressDirection: 1 | -1 = 1;
  private targetIntersectionId: string = '';
  private isSpinning: boolean = false;
  private spinElapsed: number = 0;
  private zRotation: number = 0;

  reset(startRoadId: string, startProgress: number, startIntersectionId: string): void {
    this.currentRoadId = startRoadId;
    this.currentProgress = startProgress;
    this.targetIntersectionId = startIntersectionId;
    this.progressDirection = 1;
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
    this.currentProgress += this.progressDirection * speedPerSec * deltaTime;

    if (this.progressDirection > 0) {
      this.currentProgress = Math.min(this.currentProgress, 1.0);
    } else {
      this.currentProgress = Math.max(this.currentProgress, 0.0);
    }

    this.position = road.getPositionAtProgress(this.currentProgress);
    const dir = road.getDirectionAtProgress(this.currentProgress);
    // 逆走時は方向ベクトルを反転
    const sign = this.progressDirection;
    this.rotation = Math.atan2(dir.x * sign, dir.z * sign);
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

  getProgressDirection(): 1 | -1 {
    return this.progressDirection;
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

  enterRoad(road: Road, targetIntersectionId: string): void {
    this.currentRoadId = road.id;
    this.targetIntersectionId = targetIntersectionId;

    if (targetIntersectionId === road.endIntersectionId) {
      // 順方向: start → end
      this.currentProgress = 0;
      this.progressDirection = 1;
    } else {
      // 逆方向: end → start
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
