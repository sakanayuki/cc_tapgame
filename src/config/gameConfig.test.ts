import { describe, it, expect } from 'vitest';
import { GAME_CONFIG, SCORE_MESSAGES } from './gameConfig.ts';

describe('GAME_CONFIG', () => {
  it('GC-001: ゲーム時間が正の数', () => {
    expect(GAME_CONFIG.GAME_DURATION_SEC).toBeGreaterThan(0);
  });

  it('GC-002: ゲーム時間が60秒', () => {
    expect(GAME_CONFIG.GAME_DURATION_SEC).toBe(60);
  });

  it('GC-003: 車両速度が正の数', () => {
    expect(GAME_CONFIG.VEHICLE_SPEED).toBeGreaterThan(0);
  });

  it('GC-004: 方向指示表示時間 > 入力締切時間', () => {
    expect(GAME_CONFIG.DIRECTION_SHOW_SEC).toBeGreaterThan(GAME_CONFIG.INPUT_DEADLINE_SEC);
  });

  it('GC-005: 入力締切時間が正の数', () => {
    expect(GAME_CONFIG.INPUT_DEADLINE_SEC).toBeGreaterThan(0);
  });

  it('GC-006: スピン時間が正の数', () => {
    expect(GAME_CONFIG.SPIN_DURATION_SEC).toBeGreaterThan(0);
  });

  it('GC-007: 正解スコアが正の整数', () => {
    expect(GAME_CONFIG.CORRECT_SCORE).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(GAME_CONFIG.CORRECT_SCORE)).toBe(true);
  });

  it('GC-008: 星エフェクト数が正の整数', () => {
    expect(GAME_CONFIG.STAR_EFFECT_COUNT).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(GAME_CONFIG.STAR_EFFECT_COUNT)).toBe(true);
  });
});

describe('SCORE_MESSAGES', () => {
  it('GC-010: メッセージが全スコア範囲をカバー (0から始まり最後がnull)', () => {
    expect(SCORE_MESSAGES[0].minScore).toBe(0);
    expect(SCORE_MESSAGES[SCORE_MESSAGES.length - 1].maxScore).toBeNull();
  });

  it('GC-011: メッセージの範囲が重複しない', () => {
    for (let i = 1; i < SCORE_MESSAGES.length; i++) {
      expect(SCORE_MESSAGES[i].minScore).toBe(SCORE_MESSAGES[i - 1].maxScore);
    }
  });

  it('GC-012: メッセージが空文字でない', () => {
    for (const msg of SCORE_MESSAGES) {
      expect(msg.message.length).toBeGreaterThan(0);
    }
  });
});
