import * as THREE from 'three';
import type { Vector3 } from '../types/index.ts';
import { CAMERA_CONFIG } from '../config/gameConfig.ts';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private currentLookAt: THREE.Vector3;

  constructor(aspect: number = 9 / 16) {
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
  }

  initialize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update(playerPosition: Vector3, playerRotation: number): void {
    const targetX =
      playerPosition.x -
      Math.sin(playerRotation) * CAMERA_CONFIG.FOLLOW_DISTANCE;
    const targetY = playerPosition.y + CAMERA_CONFIG.HEIGHT;
    const targetZ =
      playerPosition.z -
      Math.cos(playerRotation) * CAMERA_CONFIG.FOLLOW_DISTANCE;

    this.camera.position.x = lerp(this.camera.position.x, targetX, CAMERA_CONFIG.LERP_FACTOR);
    this.camera.position.y = lerp(this.camera.position.y, targetY, CAMERA_CONFIG.LERP_FACTOR);
    this.camera.position.z = lerp(this.camera.position.z, targetZ, CAMERA_CONFIG.LERP_FACTOR);

    const lookAtX =
      playerPosition.x +
      Math.sin(playerRotation) * CAMERA_CONFIG.LOOK_AHEAD;
    const lookAtY = playerPosition.y;
    const lookAtZ =
      playerPosition.z +
      Math.cos(playerRotation) * CAMERA_CONFIG.LOOK_AHEAD;

    this.currentLookAt.x = lerp(this.currentLookAt.x, lookAtX, CAMERA_CONFIG.LERP_FACTOR);
    this.currentLookAt.y = lerp(this.currentLookAt.y, lookAtY, CAMERA_CONFIG.LERP_FACTOR);
    this.currentLookAt.z = lerp(this.currentLookAt.z, lookAtZ, CAMERA_CONFIG.LERP_FACTOR);

    this.camera.lookAt(this.currentLookAt);
  }

  onResize(width: number, height: number): void {
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}
