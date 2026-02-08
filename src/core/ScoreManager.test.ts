import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from './ScoreManager.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';

describe('ScoreManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('reset()', () => {
    it('SM-001: 初期状態でリセット', () => {
      const sm = new ScoreManager();
      sm.reset();
      expect(sm.getCurrentScore()).toBe(0);
    });

    it('SM-002: スコア加算後にリセット', () => {
      const sm = new ScoreManager();
      for (let i = 0; i < 5; i++) sm.addScore();
      sm.reset();
      expect(sm.getCurrentScore()).toBe(0);
    });
  });

  describe('addScore()', () => {
    it('SM-010: 1回加算', () => {
      const sm = new ScoreManager();
      sm.reset();
      sm.addScore();
      expect(sm.getCurrentScore()).toBe(1);
    });

    it('SM-011: 連続加算', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 10; i++) sm.addScore();
      expect(sm.getCurrentScore()).toBe(10);
    });

    it('SM-012: 大量加算', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 100; i++) sm.addScore();
      expect(sm.getCurrentScore()).toBe(100);
    });
  });

  describe('getScoreMessage() — 境界値テスト', () => {
    it('SM-020: スコア0', () => {
      const sm = new ScoreManager();
      sm.reset();
      expect(sm.getScoreMessage()).toBe('よく頑張ったね！');
    });

    it('SM-021: スコア9 (境界値直前)', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 9; i++) sm.addScore();
      expect(sm.getScoreMessage()).toBe('よく頑張ったね！');
    });

    it('SM-022: スコア10 (境界値ちょうど)', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 10; i++) sm.addScore();
      expect(sm.getScoreMessage()).toBe('すごいすごい！！');
    });

    it('SM-023: スコア15 (中間値)', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 15; i++) sm.addScore();
      expect(sm.getScoreMessage()).toBe('すごいすごい！！');
    });

    it('SM-024: スコア19 (境界値直前)', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 19; i++) sm.addScore();
      expect(sm.getScoreMessage()).toBe('すごいすごい！！');
    });

    it('SM-025: スコア20 (境界値ちょうど)', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 20; i++) sm.addScore();
      expect(sm.getScoreMessage()).toBe('キミもパウパトロールにならない？！！');
    });

    it('SM-026: スコア50 (高スコア)', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 50; i++) sm.addScore();
      expect(sm.getScoreMessage()).toBe('キミもパウパトロールにならない？！！');
    });

    it('SM-027: スコア999 (極端な高スコア)', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 999; i++) sm.addScore();
      expect(sm.getScoreMessage()).toBe('キミもパウパトロールにならない？！！');
    });
  });

  describe('updateHighScore()', () => {
    it('SM-030: 初回ハイスコア更新', () => {
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 5; i++) sm.addScore();
      sm.updateHighScore();
      expect(localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY)).toBe('5');
    });

    it('SM-031: ハイスコア更新 (超えた場合)', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '10');
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 15; i++) sm.addScore();
      sm.updateHighScore();
      expect(localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY)).toBe('15');
    });

    it('SM-032: ハイスコア未更新 (超えない場合)', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '10');
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 5; i++) sm.addScore();
      sm.updateHighScore();
      expect(localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY)).toBe('10');
    });

    it('SM-033: ハイスコアと同点', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '10');
      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 10; i++) sm.addScore();
      sm.updateHighScore();
      expect(localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY)).toBe('10');
    });
  });

  describe('loadHighScore() — 異常値テスト', () => {
    it('SM-040: 正常値', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '10');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(10);
    });

    it('SM-041: 値なし (null)', () => {
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(0);
    });

    it('SM-042: 空文字', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(0);
    });

    it('SM-043: 非数値文字列', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, 'abc');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(0);
    });

    it('SM-044: 負の数値', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '-5');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(0);
    });

    it('SM-045: 小数', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '3.7');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(3);
    });

    it('SM-046: NaN文字列', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, 'NaN');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(0);
    });

    it('SM-047: Infinity', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, 'Infinity');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(0);
    });

    it('SM-048: JSON オブジェクト', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '{"score":10}');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(0);
    });

    it('SM-049: 非常に大きい数値', () => {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, '999999999999');
      const sm = new ScoreManager();
      expect(sm.getHighScore()).toBe(999999999999);
    });
  });

  describe('saveHighScore() — 異常値テスト', () => {
    it('SM-050: localStorage 書き込み例外', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      const sm = new ScoreManager();
      sm.reset();
      for (let i = 0; i < 5; i++) sm.addScore();

      expect(() => sm.updateHighScore()).not.toThrow();
      warnSpy.mockRestore();
    });
  });
});
