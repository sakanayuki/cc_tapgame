import { describe, it, expect } from 'vitest';
import { Road } from './Road.ts';

function createTestRoad(): Road {
  return new Road('ROAD_T', 'INT_A', 'INT_B', [
    { x: 0, y: 0, z: 0 },
    { x: 100, y: 0, z: 0 },
  ]);
}

describe('Road', () => {
  describe('getPositionAtProgress()', () => {
    it('RD-001: 始点 (0.0)', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(0.0);
      expect(pos.x).toBeCloseTo(0);
      expect(pos.z).toBeCloseTo(0);
    });

    it('RD-002: 終点 (1.0)', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(1.0);
      expect(pos.x).toBeCloseTo(100);
    });

    it('RD-003: 中間点 (0.5)', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(0.5);
      expect(pos.x).toBeCloseTo(50);
    });
  });

  describe('getPositionAtProgress() — 境界値テスト', () => {
    it('RD-010: ちょうど 0.0', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(0.0);
      expect(pos.x).toBeCloseTo(0);
    });

    it('RD-011: ちょうど 1.0', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(1.0);
      expect(pos.x).toBeCloseTo(100);
    });

    it('RD-012: 0.0 未満 (クランプ)', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(-0.1);
      expect(pos.x).toBeCloseTo(0);
    });

    it('RD-013: 1.0 超過 (クランプ)', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(1.5);
      expect(pos.x).toBeCloseTo(100);
    });

    it('RD-014: 微小値', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(0.001);
      expect(pos.x).toBeCloseTo(0.1);
    });

    it('RD-015: 1.0 直前', () => {
      const road = createTestRoad();
      const pos = road.getPositionAtProgress(0.999);
      expect(pos.x).toBeCloseTo(99.9);
    });
  });

  describe('getOppositeIntersectionId()', () => {
    it('RD-020: 始点から終点を取得', () => {
      const road = createTestRoad();
      expect(road.getOppositeIntersectionId('INT_A')).toBe('INT_B');
    });

    it('RD-021: 終点から始点を取得', () => {
      const road = createTestRoad();
      expect(road.getOppositeIntersectionId('INT_B')).toBe('INT_A');
    });

    it('RD-022: 無関係なIDを指定', () => {
      const road = createTestRoad();
      expect(() => road.getOppositeIntersectionId('INT_INVALID')).toThrow();
    });
  });

  describe('length', () => {
    it('道路の長さが正しく計算される', () => {
      const road = createTestRoad();
      expect(road.length).toBeCloseTo(100);
    });

    it('複数ウェイポイントの場合', () => {
      const road = new Road('R', 'A', 'B', [
        { x: 0, y: 0, z: 0 },
        { x: 30, y: 0, z: 0 },
        { x: 30, y: 0, z: 40 },
      ]);
      expect(road.length).toBeCloseTo(70); // 30 + 40
    });
  });
});
