import { describe, it, expect, beforeEach } from 'vitest';
import { InputHandler } from './InputHandler.ts';

describe('InputHandler', () => {
  let ih: InputHandler;

  beforeEach(() => {
    ih = new InputHandler();
  });

  describe('resolveTouchDirection() — 正常系', () => {
    it('IH-001: 左端タップ', () => {
      expect(ih.resolveTouchDirection(0, 414)).toBe('left');
    });

    it('IH-002: 左領域の中間', () => {
      expect(ih.resolveTouchDirection(69, 414)).toBe('left');
    });

    it('IH-003: 左右境界 (左側)', () => {
      expect(ih.resolveTouchDirection(137, 414)).toBe('left');
    });

    it('IH-004: 左右境界 (中央側)', () => {
      expect(ih.resolveTouchDirection(138, 414)).toBe('straight');
    });

    it('IH-005: 中央の中間', () => {
      expect(ih.resolveTouchDirection(207, 414)).toBe('straight');
    });

    it('IH-006: 中右境界 (中央側)', () => {
      expect(ih.resolveTouchDirection(275, 414)).toBe('straight');
    });

    it('IH-007: 中右境界 (右側)', () => {
      expect(ih.resolveTouchDirection(276, 414)).toBe('right');
    });

    it('IH-008: 右端タップ', () => {
      expect(ih.resolveTouchDirection(413, 414)).toBe('right');
    });
  });

  describe('resolveTouchDirection() — 境界値テスト', () => {
    it('IH-010: screenWidth/3 ちょうど', () => {
      expect(ih.resolveTouchDirection(138, 414)).toBe('straight');
    });

    it('IH-011: screenWidth*2/3 ちょうど', () => {
      expect(ih.resolveTouchDirection(276, 414)).toBe('right');
    });

    it('IH-012: 最小画面幅 (iPhone 11)', () => {
      expect(ih.resolveTouchDirection(0, 414)).toBe('left');
    });
  });

  describe('resolveTouchDirection() — 異常値テスト', () => {
    it('IH-020: 負のタッチX', () => {
      expect(ih.resolveTouchDirection(-10, 414)).toBe('left');
    });

    it('IH-021: 画面幅を超えるタッチX', () => {
      expect(ih.resolveTouchDirection(500, 414)).toBe('right');
    });

    it('IH-022: 画面幅が 0', () => {
      expect(() => ih.resolveTouchDirection(100, 0)).toThrow();
    });

    it('IH-023: 画面幅が負値', () => {
      expect(() => ih.resolveTouchDirection(100, -414)).toThrow();
    });
  });

  describe('resolveKeyDirection()', () => {
    it('IH-030: ArrowLeft', () => {
      expect(ih.resolveKeyDirection('ArrowLeft')).toBe('left');
    });

    it('IH-031: 小文字 a', () => {
      expect(ih.resolveKeyDirection('a')).toBe('left');
    });

    it('IH-032: 大文字 A', () => {
      expect(ih.resolveKeyDirection('A')).toBe('left');
    });

    it('IH-033: ArrowUp', () => {
      expect(ih.resolveKeyDirection('ArrowUp')).toBe('straight');
    });

    it('IH-034: 小文字 w', () => {
      expect(ih.resolveKeyDirection('w')).toBe('straight');
    });

    it('IH-035: 大文字 W', () => {
      expect(ih.resolveKeyDirection('W')).toBe('straight');
    });

    it('IH-036: ArrowRight', () => {
      expect(ih.resolveKeyDirection('ArrowRight')).toBe('right');
    });

    it('IH-037: 小文字 d', () => {
      expect(ih.resolveKeyDirection('d')).toBe('right');
    });

    it('IH-038: 大文字 D', () => {
      expect(ih.resolveKeyDirection('D')).toBe('right');
    });

    it('IH-039: 対応外キー (Space)', () => {
      expect(ih.resolveKeyDirection(' ')).toBeNull();
    });

    it('IH-040: 対応外キー (Enter)', () => {
      expect(ih.resolveKeyDirection('Enter')).toBeNull();
    });

    it('IH-041: 対応外キー (ArrowDown)', () => {
      expect(ih.resolveKeyDirection('ArrowDown')).toBeNull();
    });

    it('IH-042: 空文字', () => {
      expect(ih.resolveKeyDirection('')).toBeNull();
    });
  });

  describe('enable() / disable()', () => {
    it('IH-050: 無効時の入力は無視', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 414 });
      ih.initialize(container);
      ih.disable();
      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(ih.getLastInput()).toBeNull();
      ih.dispose();
    });

    it('IH-051: 有効に戻すと入力を受付', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 414 });
      ih.initialize(container);
      ih.disable();
      ih.enable();
      // キーボード入力をdocumentで発火
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(ih.getLastInput()).not.toBeNull();
      expect(ih.getLastInput()!.direction).toBe('left');
      ih.dispose();
    });

    it('IH-052: 初期状態は有効', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 414 });
      ih.initialize(container);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(ih.getLastInput()).not.toBeNull();
      ih.dispose();
    });
  });

  describe('clearLastInput()', () => {
    it('IH-060: 入力クリア', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 414 });
      ih.initialize(container);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      ih.clearLastInput();
      expect(ih.getLastInput()).toBeNull();
      ih.dispose();
    });

    it('IH-061: 既にnullの状態でクリア', () => {
      expect(() => {
        ih.clearLastInput();
        ih.clearLastInput();
      }).not.toThrow();
    });
  });

  describe('最後の入力の上書き', () => {
    it('IH-070: 複数回入力で最後が適用', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 414 });
      ih.initialize(container);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(ih.getLastInput()!.direction).toBe('straight');
      ih.dispose();
    });

    it('IH-071: 同じ方向を複数回', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 414 });
      ih.initialize(container);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(ih.getLastInput()!.direction).toBe('left');
      ih.dispose();
    });
  });
});
