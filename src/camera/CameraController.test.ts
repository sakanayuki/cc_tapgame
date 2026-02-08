import { describe, it, expect } from 'vitest';
import { CameraController } from './CameraController.ts';

describe('CameraController', () => {
  describe('update() — カメラ追従', () => {
    it('CC-001: プレーヤー前方にカメラ追従', () => {
      const cc = new CameraController(9 / 16);
      cc.update({ x: 10, y: 0, z: 10 }, 0);
      // 少なくともカメラ位置が変化する
      const cam = cc.getCamera();
      expect(cam.position.y).toBeGreaterThan(0);
    });

    it('CC-002: 回転時のカメラ追従', () => {
      const cc = new CameraController(9 / 16);
      // 多数回更新して安定させる
      for (let i = 0; i < 100; i++) cc.update({ x: 0, y: 0, z: 0 }, 0);
      const posX1 = cc.getCamera().position.x;
      for (let i = 0; i < 100; i++) cc.update({ x: 0, y: 0, z: 0 }, Math.PI / 2);
      const posX2 = cc.getCamera().position.x;
      // 回転したのでカメラX位置が大きく変化するはず
      expect(Math.abs(posX2 - posX1)).toBeGreaterThan(1);
    });
  });

  describe('onResize()', () => {
    it('CC-010: 通常リサイズ', () => {
      const cc = new CameraController(1);
      cc.onResize(414, 896);
      expect(cc.getCamera().aspect).toBeCloseTo(414 / 896, 3);
    });

    it('CC-011: 横長画面', () => {
      const cc = new CameraController(1);
      cc.onResize(896, 414);
      expect(cc.getCamera().aspect).toBeCloseTo(896 / 414, 3);
    });

    it('CC-012: width = 0', () => {
      const cc = new CameraController(1);
      const aspectBefore = cc.getCamera().aspect;
      cc.onResize(0, 896);
      expect(cc.getCamera().aspect).toBe(aspectBefore); // 変化しない
    });

    it('CC-013: height = 0', () => {
      const cc = new CameraController(1);
      const aspectBefore = cc.getCamera().aspect;
      cc.onResize(414, 0);
      expect(cc.getCamera().aspect).toBe(aspectBefore);
    });
  });
});
