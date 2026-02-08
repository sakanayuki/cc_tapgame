import type { Vector3, Direction, RouteOption, IntersectionApproach } from '../types/index.ts';
import { IntersectionNode } from './IntersectionNode.ts';
import { Road } from './Road.ts';
import { INTERSECTION_DEFINITIONS, ROAD_DEFINITIONS } from './MapData.ts';
import { logger } from '../logger/Logger.ts';

/**
 * 2つの道路の進入角度から、出る道路の相対方向 (left/straight/right) を算出する。
 * fromAngle: 進入してきた方向の角度 (atan2)
 * toAngle: 出る方向の角度
 */
function classifyDirection(fromAngle: number, toAngle: number): Direction {
  let diff = toAngle - fromAngle;
  // -π ~ π に正規化
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;

  if (diff < -Math.PI / 4) return 'right';
  if (diff > Math.PI / 4) return 'left';
  return 'straight';
}

export class MapManager {
  private intersections: Map<string, IntersectionNode> = new Map();
  private roads: Map<string, Road> = new Map();

  initialize(): void {
    this.buildRoads();
    this.buildIntersections();
    logger.info('MapManager', 'マップ初期化完了', {
      intersections: this.intersections.size,
      roads: this.roads.size,
    });
  }

  getIntersection(id: string): IntersectionNode | undefined {
    return this.intersections.get(id);
  }

  getRoad(id: string): Road | undefined {
    return this.roads.get(id);
  }

  getAllIntersections(): IntersectionNode[] {
    return Array.from(this.intersections.values());
  }

  getAllRoads(): Road[] {
    return Array.from(this.roads.values());
  }

  getAvailableRoutes(intersectionId: string, fromRoadId: string): RouteOption[] {
    const node = this.intersections.get(intersectionId);
    if (!node) return [];
    const approach = node.approaches.find(a => a.fromRoadId === fromRoadId);
    if (!approach) return [];
    return [...approach.availableRoutes];
  }

  getDistanceToIntersection(
    roadId: string,
    positionOnRoad: number,
    _targetIntersectionId: string,
  ): number {
    const road = this.roads.get(roadId);
    if (!road) return Infinity;
    return (1 - Math.max(0, Math.min(1, positionOnRoad))) * road.length;
  }

  private buildRoads(): void {
    const intMap = new Map(INTERSECTION_DEFINITIONS.map(d => [d.id, d]));

    for (const def of ROAD_DEFINITIONS) {
      const startInt = intMap.get(def.start);
      const endInt = intMap.get(def.end);
      if (!startInt || !endInt) {
        logger.fatal('MapManager', '道路定義エラー: 交差点が見つかりません', { roadId: def.id });
        continue;
      }
      const waypoints: Vector3[] = [
        { ...startInt.position },
        { ...endInt.position },
      ];
      this.roads.set(def.id, new Road(def.id, def.start, def.end, waypoints));
    }
  }

  private buildIntersections(): void {
    for (const def of INTERSECTION_DEFINITIONS) {
      // この交差点に接続する道路を見つける
      const connectedRoads: { roadId: string; otherIntersectionId: string }[] = [];
      for (const road of this.roads.values()) {
        if (road.startIntersectionId === def.id) {
          connectedRoads.push({ roadId: road.id, otherIntersectionId: road.endIntersectionId });
        } else if (road.endIntersectionId === def.id) {
          connectedRoads.push({ roadId: road.id, otherIntersectionId: road.startIntersectionId });
        }
      }

      // 各進入道路についてアプローチを生成
      const approaches: IntersectionApproach[] = [];
      for (const incoming of connectedRoads) {
        // 進入方向の角度: 接続先 → この交差点
        const otherPos = INTERSECTION_DEFINITIONS.find(d => d.id === incoming.otherIntersectionId)?.position;
        if (!otherPos) continue;

        const incomingAngle = Math.atan2(
          def.position.x - otherPos.x,
          def.position.z - otherPos.z,
        );

        // 出る方向の候補 (進入してきた道路以外)
        const availableRoutes: RouteOption[] = [];
        for (const outgoing of connectedRoads) {
          if (outgoing.roadId === incoming.roadId) continue; // Uターン不可

          const outPos = INTERSECTION_DEFINITIONS.find(d => d.id === outgoing.otherIntersectionId)?.position;
          if (!outPos) continue;

          const outgoingAngle = Math.atan2(
            outPos.x - def.position.x,
            outPos.z - def.position.z,
          );

          const direction = classifyDirection(incomingAngle, outgoingAngle);
          availableRoutes.push({
            direction,
            nextIntersectionId: outgoing.otherIntersectionId,
            roadId: outgoing.roadId,
          });
        }

        approaches.push({ fromRoadId: incoming.roadId, availableRoutes });
      }

      this.intersections.set(
        def.id,
        new IntersectionNode(def.id, def.position, def.type, approaches, def.landmark),
      );
    }
  }
}
