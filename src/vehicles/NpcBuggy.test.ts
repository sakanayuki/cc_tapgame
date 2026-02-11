import { describe, it, expect, beforeEach } from 'vitest';
import { NpcBuggy } from './NpcBuggy.ts';
import { Road } from '../map/Road.ts';

describe('NpcBuggy', () => {
  let npc: NpcBuggy;

  beforeEach(() => {
    npc = new NpcBuggy();
  });

  describe('decideDirection() — 正常系', () => {
    it('NB-001: 3方向から選択', () => {
      const dir = npc.decideDirection(['left', 'straight', 'right']);
      expect(['left', 'straight', 'right']).toContain(dir);
    });

    it('NB-002: 2方向から選択', () => {
      const dir = npc.decideDirection(['left', 'right']);
      expect(['left', 'right']).toContain(dir);
    });

    it('NB-003: 1方向のみ', () => {
      const dir = npc.decideDirection(['straight']);
      expect(dir).toBe('straight');
    });
  });

  describe('decideDirection() — 異常値テスト', () => {
    it('NB-010: 空配列', () => {
      expect(() => npc.decideDirection([])).toThrow();
    });
  });

  describe('decideDirection() — ランダム性の統計検証', () => {
    it('NB-020: 均等分布の確認', () => {
      const counts = { left: 0, straight: 0, right: 0 };
      const trials = 1000;
      for (let i = 0; i < trials; i++) {
        const dir = npc.decideDirection(['left', 'straight', 'right']);
        counts[dir]++;
      }
      // 各方向が 25%〜42% の範囲に収まることを検証
      for (const key of ['left', 'straight', 'right'] as const) {
        const ratio = counts[key] / trials;
        expect(ratio).toBeGreaterThan(0.2);
        expect(ratio).toBeLessThan(0.5);
      }
    });
  });

  describe('getChosenDirection()', () => {
    it('NB-030: 初期状態', () => {
      expect(npc.getChosenDirection()).toBeNull();
    });

    it('NB-031: 方向決定後', () => {
      npc.decideDirection(['left', 'right']);
      expect(npc.getChosenDirection()).not.toBeNull();
    });
  });

  describe('enterRoad() — 双方向走行', () => {
    it('NB-040: 順方向に進入', () => {
      const road = new Road('ROAD_02', 'INT_03', 'INT_05', [
        { x: 0, y: 0, z: 0 },
        { x: 50, y: 0, z: 0 },
      ]);
      npc.enterRoad(road, 'INT_05');
      expect(npc.getCurrentRoadId()).toBe('ROAD_02');
      expect(npc.getCurrentProgress()).toBe(0);
      expect(npc.getProgressDirection()).toBe(1);
    });

    it('NB-041: 逆方向に進入', () => {
      const road = new Road('ROAD_02', 'INT_03', 'INT_05', [
        { x: 0, y: 0, z: 0 },
        { x: 50, y: 0, z: 0 },
      ]);
      npc.enterRoad(road, 'INT_03');
      expect(npc.getCurrentRoadId()).toBe('ROAD_02');
      expect(npc.getCurrentProgress()).toBe(1);
      expect(npc.getProgressDirection()).toBe(-1);
    });

    it('NB-042: 逆方向走行の到達判定', () => {
      const road = new Road('ROAD_02', 'INT_03', 'INT_05', [
        { x: 0, y: 0, z: 0 },
        { x: 50, y: 0, z: 0 },
      ]);
      npc.enterRoad(road, 'INT_03');
      npc.update(10, road);
      expect(npc.hasReachedIntersection()).toBe(true);
    });
  });
});
