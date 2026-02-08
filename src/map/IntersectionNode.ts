import type {
  Vector3,
  IntersectionType,
  LandmarkType,
  IntersectionApproach,
  Direction,
  RouteOption,
} from '../types/index.ts';

export class IntersectionNode {
  readonly id: string;
  readonly position: Vector3;
  readonly type: IntersectionType;
  readonly approaches: readonly IntersectionApproach[];
  readonly landmark: LandmarkType | null;

  constructor(
    id: string,
    position: Vector3,
    type: IntersectionType,
    approaches: IntersectionApproach[],
    landmark: LandmarkType | null = null,
  ) {
    this.id = id;
    this.position = { ...position };
    this.type = type;
    this.approaches = Object.freeze(approaches.map(a => ({
      ...a,
      availableRoutes: [...a.availableRoutes],
    })));
    this.landmark = landmark;
  }

  getAvailableDirections(fromRoadId: string): Direction[] {
    const approach = this.approaches.find(a => a.fromRoadId === fromRoadId);
    if (!approach) return [];
    return approach.availableRoutes.map(r => r.direction);
  }

  getRoute(fromRoadId: string, direction: Direction): RouteOption | undefined {
    const approach = this.approaches.find(a => a.fromRoadId === fromRoadId);
    if (!approach) return undefined;
    return approach.availableRoutes.find(r => r.direction === direction);
  }
}
