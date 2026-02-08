import { describe, it, expect } from 'vitest';
import { IntersectionNode } from './IntersectionNode.ts';
import type { IntersectionApproach } from '../types/index.ts';

function createCrossIntersection(): IntersectionNode {
  const approaches: IntersectionApproach[] = [
    {
      fromRoadId: 'ROAD_A',
      availableRoutes: [
        { direction: 'left', nextIntersectionId: 'INT_L', roadId: 'ROAD_L' },
        { direction: 'straight', nextIntersectionId: 'INT_S', roadId: 'ROAD_S' },
        { direction: 'right', nextIntersectionId: 'INT_R', roadId: 'ROAD_R' },
      ],
    },
  ];
  return new IntersectionNode('INT_T', { x: 0, y: 0, z: 0 }, 'cross', approaches);
}

function createTJunction(): IntersectionNode {
  const approaches: IntersectionApproach[] = [
    {
      fromRoadId: 'ROAD_A',
      availableRoutes: [
        { direction: 'left', nextIntersectionId: 'INT_L', roadId: 'ROAD_L' },
        { direction: 'right', nextIntersectionId: 'INT_R', roadId: 'ROAD_R' },
      ],
    },
  ];
  return new IntersectionNode('INT_T', { x: 0, y: 0, z: 0 }, 't-junction', approaches);
}

describe('IntersectionNode', () => {
  describe('getAvailableDirections()', () => {
    it('IN-001: 十字路で3方向', () => {
      const node = createCrossIntersection();
      const dirs = node.getAvailableDirections('ROAD_A');
      expect(dirs).toEqual(['left', 'straight', 'right']);
    });

    it('IN-002: T字路で2方向', () => {
      const node = createTJunction();
      const dirs = node.getAvailableDirections('ROAD_A');
      expect(dirs).toEqual(['left', 'right']);
    });

    it('IN-003: 存在しない道路ID', () => {
      const node = createCrossIntersection();
      const dirs = node.getAvailableDirections('ROAD_INVALID');
      expect(dirs).toEqual([]);
    });
  });

  describe('getRoute()', () => {
    it('IN-010: 有効なルート', () => {
      const node = createCrossIntersection();
      const route = node.getRoute('ROAD_A', 'left');
      expect(route).toBeDefined();
      expect(route!.nextIntersectionId).toBe('INT_L');
      expect(route!.roadId).toBe('ROAD_L');
    });

    it('IN-011: T字路で直進 (不可方向)', () => {
      const node = createTJunction();
      const route = node.getRoute('ROAD_A', 'straight');
      expect(route).toBeUndefined();
    });

    it('IN-012: 存在しない道路からの進入', () => {
      const node = createCrossIntersection();
      const route = node.getRoute('ROAD_INVALID', 'left');
      expect(route).toBeUndefined();
    });
  });
});
