import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimerManager } from './TimerManager.ts';

describe('TimerManager', () => {
  let tm: TimerManager;

  beforeEach(() => {
    tm = new TimerManager();
    tm.reset();
  });

  describe('reset()', () => {
    it('TM-001: 初期リセット', () => {
      expect(tm.getRemainingTime()).toBe(60.0);
    });

    it('TM-002: 途中からリセット', () => {
      tm.start();
      tm.update(0.1); // MAX_DELTA_TIME = 0.1
      tm.update(0.1);
      tm.update(0.1);
      tm.reset();
      expect(tm.getRemainingTime()).toBe(60.0);
    });
  });

  describe('update() — 正常系', () => {
    it('TM-010: 通常のフレーム更新', () => {
      tm.start();
      tm.update(0.016);
      expect(tm.getRemainingTime()).toBeCloseTo(59.984, 3);
    });

    it('TM-011: deltaTime がMAX_DELTA_TIMEにクランプされる', () => {
      tm.start();
      tm.update(1.0); // クランプされて0.1秒のみ減算
      expect(tm.getRemainingTime()).toBeCloseTo(59.9, 3);
    });

    it('TM-012: ちょうど0秒に到達', () => {
      const callback = vi.fn();
      tm.setOnTimeUp(callback);
      tm.start();
      // 残り0.05秒にする (MAX_DELTA_TIME=0.1なので、0.1秒ずつ減らす)
      for (let i = 0; i < 599; i++) tm.update(0.1);
      // この時点で残り0.1秒
      expect(tm.getRemainingTime()).toBeCloseTo(0.1, 1);
      tm.update(0.1);
      expect(tm.getRemainingTime()).toBe(0);
      expect(callback).toHaveBeenCalledOnce();
    });

    it('TM-013: 0秒を通過 — 0にクランプ', () => {
      const callback = vi.fn();
      tm.setOnTimeUp(callback);
      tm.start();
      // 残りを0.05にする
      for (let i = 0; i < 599; i++) tm.update(0.1);
      tm.update(0.05);
      expect(tm.getRemainingTime()).toBeCloseTo(0.05, 2);
      tm.update(0.1); // これで0を超えてしまうが0にクランプ
      expect(tm.getRemainingTime()).toBe(0);
      expect(callback).toHaveBeenCalledOnce();
    });

    it('TM-014: 停止中は更新しない', () => {
      tm.start();
      tm.stop();
      tm.update(0.016);
      expect(tm.getRemainingTime()).toBe(60.0);
    });
  });

  describe('update() — 境界値テスト', () => {
    it('TM-020: deltaTime = 0', () => {
      tm.start();
      tm.update(0.0);
      expect(tm.getRemainingTime()).toBe(60.0);
    });

    it('TM-021: deltaTime が負値', () => {
      tm.start();
      tm.update(-0.1);
      expect(tm.getRemainingTime()).toBe(60.0);
    });

    it('TM-022: deltaTime が極大値', () => {
      tm.start();
      tm.update(5.0);
      expect(tm.getRemainingTime()).toBeCloseTo(59.9, 3);
    });

    it('TM-023: 残り時間が既に0の場合 — onTimeUpは再発火しない', () => {
      const callback = vi.fn();
      tm.setOnTimeUp(callback);
      tm.start();
      for (let i = 0; i < 600; i++) tm.update(0.1);
      expect(callback).toHaveBeenCalledOnce();
      // 0になった後にさらにupdate
      tm.start(); // 再度start
      tm.update(0.016);
      expect(callback).toHaveBeenCalledOnce(); // 2回目は呼ばれない
    });
  });

  describe('onTimeUp コールバック', () => {
    it('TM-030: コールバック発火は1度だけ', () => {
      const callback = vi.fn();
      tm.setOnTimeUp(callback);
      tm.start();
      for (let i = 0; i < 605; i++) tm.update(0.1);
      expect(callback).toHaveBeenCalledOnce();
    });

    it('TM-031: コールバック未登録でもエラーなし', () => {
      tm.start();
      expect(() => {
        for (let i = 0; i < 601; i++) tm.update(0.1);
      }).not.toThrow();
    });
  });

  describe('getDisplayTime()', () => {
    it('TM-040: 60秒 (最大)', () => {
      expect(tm.getDisplayTime()).toBe('01:00');
    });

    it('TM-041: 45.3秒', () => {
      tm.start();
      // 60 - 45.3 = 14.7秒消費 → 0.1ずつ147回
      for (let i = 0; i < 147; i++) tm.update(0.1);
      expect(tm.getDisplayTime()).toBe('00:46');
    });

    it('TM-042: 9.99秒', () => {
      tm.start();
      for (let i = 0; i < 501; i++) tm.update(0.1);
      // 残り 60 - 50.1 = 9.9
      expect(tm.getDisplayTime()).toBe('00:10');
    });

    it('TM-043: 約1.0秒', () => {
      tm.start();
      for (let i = 0; i < 590; i++) tm.update(0.1);
      expect(tm.getDisplayTime()).toBe('00:01');
    });

    it('TM-045: 0秒 (終了)', () => {
      tm.start();
      for (let i = 0; i < 600; i++) tm.update(0.1);
      expect(tm.getDisplayTime()).toBe('00:00');
    });
  });
});
