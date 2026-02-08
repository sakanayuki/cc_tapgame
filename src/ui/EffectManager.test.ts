import { describe, it, expect, beforeEach } from 'vitest';
import { EffectManager } from './EffectManager.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';

describe('EffectManager', () => {
  let em: EffectManager;
  let container: HTMLElement;

  beforeEach(() => {
    em = new EffectManager();
    container = document.createElement('div');
    document.body.appendChild(container);
    em.initialize(container);
  });

  describe('playCorrectEffect()', () => {
    it('EM-001: エフェクト生成数', () => {
      em.playCorrectEffect();
      // 12 stars + 1 text = 13
      expect(em.getActiveEffectCount()).toBe(GAME_CONFIG.STAR_EFFECT_COUNT + 1);
    });

    it('EM-002: テキストの内容', () => {
      em.playCorrectEffect();
      const textEl = container.querySelector('.effect-text');
      expect(textEl).not.toBeNull();
      expect(textEl!.textContent).toBe('Great!');
    });
  });

  describe('update() — エフェクトのライフサイクル', () => {
    it('EM-010: エフェクト表示中', () => {
      em.playCorrectEffect();
      em.update(0.5);
      expect(em.getActiveEffectCount()).toBeGreaterThan(0);
    });

    it('EM-011: エフェクト消滅 (1秒後)', () => {
      em.playCorrectEffect();
      em.update(GAME_CONFIG.CORRECT_EFFECT_DURATION_SEC);
      expect(em.getActiveEffectCount()).toBe(0);
    });

    it('EM-012: 連続再生', () => {
      em.playCorrectEffect();
      em.update(0.5);
      const countBefore = em.getActiveEffectCount();
      em.playCorrectEffect();
      expect(em.getActiveEffectCount()).toBeGreaterThan(countBefore);
    });
  });

  describe('clearAll()', () => {
    it('EM-020: 全クリア', () => {
      em.playCorrectEffect();
      em.clearAll();
      expect(em.getActiveEffectCount()).toBe(0);
    });

    it('EM-021: 空の状態でクリア', () => {
      expect(() => em.clearAll()).not.toThrow();
    });
  });
});
