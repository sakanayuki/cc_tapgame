import { describe, it, expect, beforeAll, vi } from 'vitest';
import { MapManager } from './MapManager.ts';
import { INTERSECTION_DEFINITIONS, ROAD_DEFINITIONS } from './MapData.ts';

describe('MapManager', () => {
  let mm: MapManager;

  beforeAll(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    mm = new MapManager();
    mm.initialize();
  });

  describe('getIntersection()', () => {
    it('MM-001: 存在するID', () => {
      const node = mm.getIntersection('INT_01');
      expect(node).toBeDefined();
      expect(node!.id).toBe('INT_01');
    });

    it('MM-002: 存在しないID', () => {
      expect(mm.getIntersection('INT_99')).toBeUndefined();
    });

    it('MM-003: 空文字', () => {
      expect(mm.getIntersection('')).toBeUndefined();
    });
  });

  describe('getRoad()', () => {
    it('MM-010: 存在するID', () => {
      const road = mm.getRoad('ROAD_01');
      expect(road).toBeDefined();
      expect(road!.id).toBe('ROAD_01');
    });

    it('MM-011: 存在しないID', () => {
      expect(mm.getRoad('ROAD_99')).toBeUndefined();
    });
  });

  describe('getAvailableRoutes()', () => {
    it('MM-020: 十字路の有効なルート (3方向)', () => {
      // INT_02 は cross で ROAD_10, ROAD_09, ROAD_11 が接続
      const routes = mm.getAvailableRoutes('INT_02', 'ROAD_10');
      expect(routes.length).toBeGreaterThanOrEqual(2);
    });

    it('MM-021: T字路の有効なルート (2方向)', () => {
      // INT_01 は t-junction で ROAD_01, ROAD_10 が接続
      const routes = mm.getAvailableRoutes('INT_01', 'ROAD_10');
      expect(routes.length).toBeGreaterThanOrEqual(1);
    });

    it('MM-022: 存在しない交差点ID', () => {
      const routes = mm.getAvailableRoutes('INT_99', 'ROAD_01');
      expect(routes).toEqual([]);
    });

    it('MM-023: 存在しない道路ID', () => {
      const routes = mm.getAvailableRoutes('INT_01', 'ROAD_99');
      expect(routes).toEqual([]);
    });
  });

  describe('マップデータ整合性検証', () => {
    it('MM-030: 全道路の始点・終点が有効な交差点', () => {
      const intIds = new Set(INTERSECTION_DEFINITIONS.map(d => d.id));
      for (const road of ROAD_DEFINITIONS) {
        expect(intIds.has(road.start)).toBe(true);
        expect(intIds.has(road.end)).toBe(true);
      }
    });

    it('MM-031: 全交差点に最低2本の道路が接続 (行き止まりなし)', () => {
      for (const intDef of INTERSECTION_DEFINITIONS) {
        const count = ROAD_DEFINITIONS.filter(
          r => r.start === intDef.id || r.end === intDef.id,
        ).length;
        expect(count).toBeGreaterThanOrEqual(2);
      }
    });

    it('MM-032: 交差点IDの一意性', () => {
      const ids = INTERSECTION_DEFINITIONS.map(d => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('MM-033: 道路IDの一意性', () => {
      const ids = ROAD_DEFINITIONS.map(d => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('MM-034: ルックアウトタワーが存在する', () => {
      const hasLookout = INTERSECTION_DEFINITIONS.some(d => d.landmark === 'lookoutTower');
      expect(hasLookout).toBe(true);
    });

    it('MM-035: グラフの連結性 (全交差点が到達可能)', () => {
      // BFS で連結性を確認
      const adjMap = new Map<string, Set<string>>();
      for (const intDef of INTERSECTION_DEFINITIONS) {
        adjMap.set(intDef.id, new Set());
      }
      for (const road of ROAD_DEFINITIONS) {
        adjMap.get(road.start)!.add(road.end);
        adjMap.get(road.end)!.add(road.start);
      }

      const visited = new Set<string>();
      const queue = [INTERSECTION_DEFINITIONS[0].id];
      visited.add(queue[0]);

      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const neighbor of adjMap.get(current)!) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      expect(visited.size).toBe(INTERSECTION_DEFINITIONS.length);
    });

    it('MM-036: 交差点数が10', () => {
      expect(INTERSECTION_DEFINITIONS.length).toBe(10);
    });

    it('MM-037: 行き止まりなし — 全交差点で全進入方向に対し出口がある', () => {
      for (const intNode of mm.getAllIntersections()) {
        for (const approach of intNode.approaches) {
          expect(approach.availableRoutes.length).toBeGreaterThanOrEqual(1);
        }
      }
    });
  });
});
