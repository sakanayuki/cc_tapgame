import { describe, it, expect, beforeEach } from 'vitest';
import { IntersectionJudge } from './IntersectionJudge.ts';
import type { PlayerInput } from '../types/index.ts';

describe('IntersectionJudge', () => {
  let judge: IntersectionJudge;

  beforeEach(() => {
    judge = new IntersectionJudge();
  });

  describe('update() — 接近検知', () => {
    it('IJ-001: 交差点まで3秒超', () => {
      judge.update(100.0, 20.0); // 100/20 = 5秒
      expect(judge.getIsApproaching()).toBe(false);
    });

    it('IJ-002: 交差点までちょうど3秒', () => {
      judge.update(60.0, 20.0); // 60/20 = 3秒
      expect(judge.getIsApproaching()).toBe(true);
    });

    it('IJ-003: 交差点まで2秒', () => {
      judge.update(40.0, 20.0);
      expect(judge.getIsApproaching()).toBe(true);
    });

    it('IJ-004: 交差点まで0.1秒超', () => {
      judge.update(2.1, 20.0); // 2.1/20 = 0.105秒
      expect(judge.getIsApproaching()).toBe(true);
      expect(judge.getIsInputLocked()).toBe(false);
    });

    it('IJ-005: 交差点までちょうど0.1秒', () => {
      judge.update(2.0, 20.0); // 2/20 = 0.1秒
      expect(judge.getIsInputLocked()).toBe(true);
    });

    it('IJ-006: 交差点まで0.05秒', () => {
      judge.update(1.0, 20.0); // 1/20 = 0.05秒
      expect(judge.getIsInputLocked()).toBe(true);
    });
  });

  describe('update() — 異常値テスト', () => {
    it('IJ-010: speed が 0', () => {
      judge.update(50.0, 0.0);
      expect(judge.getIsApproaching()).toBe(false); // 更新されない (初期値)
    });

    it('IJ-011: speed が負値', () => {
      judge.update(50.0, -5.0);
      expect(judge.getIsApproaching()).toBe(false);
    });

    it('IJ-012: distance が 0', () => {
      judge.update(0.0, 20.0);
      expect(judge.getIsApproaching()).toBe(true);
      expect(judge.getIsInputLocked()).toBe(true);
    });

    it('IJ-013: distance が負値', () => {
      judge.update(-10.0, 20.0);
      expect(judge.getIsApproaching()).toBe(true);
      expect(judge.getIsInputLocked()).toBe(true);
    });
  });

  describe('judge() — 十字路での正解判定', () => {
    beforeEach(() => {
      judge.setAvailableDirections(['left', 'straight', 'right']);
    });

    it('IJ-020: 左折で正解', () => {
      const input: PlayerInput = { direction: 'left', timestamp: 1 };
      const result = judge.judge(input, 'left', 'INT_01');
      expect(result.isCorrect).toBe(true);
    });

    it('IJ-021: 直進で正解', () => {
      const input: PlayerInput = { direction: 'straight', timestamp: 1 };
      const result = judge.judge(input, 'straight', 'INT_01');
      expect(result.isCorrect).toBe(true);
    });

    it('IJ-022: 右折で正解', () => {
      const input: PlayerInput = { direction: 'right', timestamp: 1 };
      const result = judge.judge(input, 'right', 'INT_01');
      expect(result.isCorrect).toBe(true);
    });

    it('IJ-023: 左折で不正解 (正解は右)', () => {
      const input: PlayerInput = { direction: 'left', timestamp: 1 };
      const result = judge.judge(input, 'right', 'INT_01');
      expect(result.isCorrect).toBe(false);
    });

    it('IJ-024: 直進で不正解 (正解は左)', () => {
      const input: PlayerInput = { direction: 'straight', timestamp: 1 };
      const result = judge.judge(input, 'left', 'INT_01');
      expect(result.isCorrect).toBe(false);
    });

    it('IJ-025: 右折で不正解 (正解は直進)', () => {
      const input: PlayerInput = { direction: 'right', timestamp: 1 };
      const result = judge.judge(input, 'straight', 'INT_01');
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('judge() — T字路での判定', () => {
    beforeEach(() => {
      judge.setAvailableDirections(['left', 'right']);
    });

    it('IJ-030: T字路で左折正解', () => {
      const input: PlayerInput = { direction: 'left', timestamp: 1 };
      const result = judge.judge(input, 'left', 'INT_01');
      expect(result.isCorrect).toBe(true);
    });

    it('IJ-031: T字路で右折正解', () => {
      const input: PlayerInput = { direction: 'right', timestamp: 1 };
      const result = judge.judge(input, 'right', 'INT_01');
      expect(result.isCorrect).toBe(true);
    });

    it('IJ-032: T字路で直進選択 (不正解)', () => {
      const input: PlayerInput = { direction: 'straight', timestamp: 1 };
      const result = judge.judge(input, 'left', 'INT_01');
      expect(result.isCorrect).toBe(false);
    });

    it('IJ-033: T字路で左折不正解', () => {
      const input: PlayerInput = { direction: 'left', timestamp: 1 };
      const result = judge.judge(input, 'right', 'INT_01');
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('judge() — 入力なし (null)', () => {
    it('IJ-040: 入力なし、十字路、NPC直進', () => {
      judge.setAvailableDirections(['left', 'straight', 'right']);
      const result = judge.judge(null, 'straight', 'INT_01');
      expect(result.isCorrect).toBe(true);
    });

    it('IJ-041: 入力なし、十字路、NPC左折', () => {
      judge.setAvailableDirections(['left', 'straight', 'right']);
      const result = judge.judge(null, 'left', 'INT_01');
      expect(result.isCorrect).toBe(false);
    });

    it('IJ-042: 入力なし、T字路 (直進不可)、NPC左折', () => {
      judge.setAvailableDirections(['left', 'right']);
      const result = judge.judge(null, 'left', 'INT_01');
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('judge() — 結果オブジェクトの検証', () => {
    it('IJ-050: 正解時の結果オブジェクト', () => {
      judge.setAvailableDirections(['left', 'straight', 'right']);
      const input: PlayerInput = { direction: 'left', timestamp: 1 };
      const result = judge.judge(input, 'left', 'INT_03');
      expect(result).toEqual({
        isCorrect: true,
        playerDirection: 'left',
        correctDirection: 'left',
        intersectionId: 'INT_03',
      });
    });

    it('IJ-051: 不正解時の結果オブジェクト', () => {
      judge.setAvailableDirections(['left', 'straight', 'right']);
      const input: PlayerInput = { direction: 'right', timestamp: 1 };
      const result = judge.judge(input, 'left', 'INT_03');
      expect(result).toEqual({
        isCorrect: false,
        playerDirection: 'right',
        correctDirection: 'left',
        intersectionId: 'INT_03',
      });
    });

    it('IJ-052: intersectionId が正しく設定される', () => {
      judge.setAvailableDirections(['left', 'straight', 'right']);
      const result = judge.judge(null, 'straight', 'INT_05');
      expect(result.intersectionId).toBe('INT_05');
    });
  });

  describe('resetState()', () => {
    it('IJ-060: リセット後の状態', () => {
      judge.update(40.0, 20.0); // isApproaching = true
      judge.setAvailableDirections(['left', 'right']);
      judge.resetState();
      expect(judge.getIsApproaching()).toBe(false);
      expect(judge.getIsInputLocked()).toBe(false);
      expect(judge.getAvailableDirections()).toEqual([]);
    });
  });
});
