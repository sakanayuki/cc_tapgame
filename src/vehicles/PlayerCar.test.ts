import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerCar } from './PlayerCar.ts';
import { Road } from '../map/Road.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';

function createTestRoad(): Road {
  return new Road('ROAD_T', 'INT_A', 'INT_B', [
    { x: 0, y: 0, z: 0 },
    { x: 100, y: 0, z: 0 },
  ]);
}

describe('PlayerCar', () => {
  let car: PlayerCar;
  let road: Road;

  beforeEach(() => {
    car = new PlayerCar();
    road = createTestRoad();
    car.reset('ROAD_T', 0.0, 'INT_B');
  });

  describe('update() — 通常走行', () => {
    it('PC-001: 進行率が増加する', () => {
      car.update(0.016, road);
      expect(car.getCurrentProgress()).toBeGreaterThan(0);
    });

    it('PC-002: 道路の終端に近づく', () => {
      for (let i = 0; i < 100; i++) car.update(0.1, road);
      expect(car.getCurrentProgress()).toBeGreaterThan(0.5);
    });
  });

  describe('startSpin() / スピン動作', () => {
    it('PC-010: スピン開始', () => {
      car.startSpin();
      expect(car.getIsSpinning()).toBe(true);
    });

    it('PC-011: スピン中は位置更新しない', () => {
      car.update(0.1, road);
      const posBefore = car.getPosition();
      car.startSpin();
      car.update(0.1, road);
      const posAfter = car.getPosition();
      expect(posAfter.x).toBeCloseTo(posBefore.x);
      expect(posAfter.z).toBeCloseTo(posBefore.z);
    });

    it('PC-012: スピン中のZ軸回転 (0.5秒時点)', () => {
      car.startSpin();
      car.update(0.5, road);
      expect(car.getZRotation()).toBeCloseTo(Math.PI, 1);
    });

    it('PC-013: スピン完了 (1.0秒後)', () => {
      car.startSpin();
      car.update(GAME_CONFIG.SPIN_DURATION_SEC, road);
      expect(car.getIsSpinning()).toBe(false);
    });

    it('PC-014: スピン完了後に走行再開', () => {
      car.startSpin();
      car.update(GAME_CONFIG.SPIN_DURATION_SEC, road);
      const progressBefore = car.getCurrentProgress();
      car.update(0.1, road);
      expect(car.getCurrentProgress()).toBeGreaterThan(progressBefore);
    });
  });

  describe('スピン — 境界値テスト', () => {
    it('PC-020: 0秒 (開始直後)', () => {
      car.startSpin();
      expect(car.getZRotation()).toBeCloseTo(0);
      expect(car.getIsSpinning()).toBe(true);
    });

    it('PC-021: 0.999秒', () => {
      car.startSpin();
      car.update(0.099, road); // MAX_DELTA_TIME clamped, but PlayerCar uses raw
      // Actually PlayerCar doesn't clamp deltaTime itself, let's just test
      car.update(0.1, road);
      car.update(0.1, road);
      car.update(0.1, road);
      car.update(0.1, road);
      car.update(0.1, road);
      car.update(0.1, road);
      car.update(0.1, road);
      car.update(0.1, road);
      car.update(0.099, road);
      expect(car.getIsSpinning()).toBe(true);
    });

    it('PC-022: 1.0秒ちょうど', () => {
      car.startSpin();
      car.update(1.0, road);
      expect(car.getIsSpinning()).toBe(false);
    });

    it('PC-023: 1.001秒', () => {
      car.startSpin();
      car.update(1.001, road);
      expect(car.getIsSpinning()).toBe(false);
    });
  });

  describe('enterRoad()', () => {
    it('PC-030: 新しい道路に進入', () => {
      car.enterRoad('ROAD_02', 'INT_05');
      expect(car.getCurrentRoadId()).toBe('ROAD_02');
      expect(car.getCurrentProgress()).toBe(0);
      expect(car.getTargetIntersectionId()).toBe('INT_05');
    });
  });
});
