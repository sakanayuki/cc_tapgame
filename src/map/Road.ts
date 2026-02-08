import type { Vector3 } from '../types/index.ts';

export class Road {
  readonly id: string;
  readonly startIntersectionId: string;
  readonly endIntersectionId: string;
  readonly waypoints: readonly Vector3[];
  readonly length: number;

  constructor(id: string, startId: string, endId: string, waypoints: Vector3[]) {
    this.id = id;
    this.startIntersectionId = startId;
    this.endIntersectionId = endId;
    this.waypoints = Object.freeze([...waypoints]);
    this.length = this.calculateLength();
  }

  getPositionAtProgress(progress: number): Vector3 {
    const p = Math.max(0, Math.min(1, progress));
    if (this.waypoints.length < 2) {
      return { ...this.waypoints[0] };
    }

    const targetDist = p * this.length;
    let accumulated = 0;

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const a = this.waypoints[i];
      const b = this.waypoints[i + 1];
      const segLen = this.dist(a, b);

      if (accumulated + segLen >= targetDist) {
        const t = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
        return {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t,
          z: a.z + (b.z - a.z) * t,
        };
      }
      accumulated += segLen;
    }

    const last = this.waypoints[this.waypoints.length - 1];
    return { ...last };
  }

  getDirectionAtProgress(progress: number): Vector3 {
    const p = Math.max(0, Math.min(1, progress));
    if (this.waypoints.length < 2) {
      return { x: 0, y: 0, z: 1 };
    }

    const targetDist = p * this.length;
    let accumulated = 0;

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const a = this.waypoints[i];
      const b = this.waypoints[i + 1];
      const segLen = this.dist(a, b);

      if (accumulated + segLen >= targetDist || i === this.waypoints.length - 2) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (len === 0) return { x: 0, y: 0, z: 1 };
        return { x: dx / len, y: dy / len, z: dz / len };
      }
      accumulated += segLen;
    }

    return { x: 0, y: 0, z: 1 };
  }

  getOppositeIntersectionId(fromIntersectionId: string): string {
    if (fromIntersectionId === this.startIntersectionId) {
      return this.endIntersectionId;
    }
    if (fromIntersectionId === this.endIntersectionId) {
      return this.startIntersectionId;
    }
    throw new Error(
      `Intersection ${fromIntersectionId} is not connected to road ${this.id}`,
    );
  }

  private calculateLength(): number {
    let total = 0;
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      total += this.dist(this.waypoints[i], this.waypoints[i + 1]);
    }
    return total;
  }

  private dist(a: Vector3, b: Vector3): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
