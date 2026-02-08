import { GAME_CONFIG, SCORE_MESSAGES } from '../config/gameConfig.ts';
import { logger } from '../logger/Logger.ts';

export class ScoreManager {
  private currentScore: number = 0;
  private highScore: number = 0;

  constructor() {
    this.highScore = this.loadHighScore();
  }

  reset(): void {
    this.currentScore = 0;
  }

  addScore(): void {
    this.currentScore += GAME_CONFIG.CORRECT_SCORE;
  }

  getCurrentScore(): number {
    return this.currentScore;
  }

  getHighScore(): number {
    return this.highScore;
  }

  updateHighScore(): void {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore(this.highScore);
    }
  }

  getScoreMessage(): string {
    for (const entry of SCORE_MESSAGES) {
      if (entry.maxScore === null || this.currentScore < entry.maxScore) {
        return entry.message;
      }
    }
    return SCORE_MESSAGES[SCORE_MESSAGES.length - 1].message;
  }

  private loadHighScore(): number {
    try {
      const raw = localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY);
      if (raw === null) return 0;

      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        logger.warn('ScoreManager', 'ハイスコアの値が不正です。デフォルト値を使用します', { raw });
        return 0;
      }
      return Math.floor(parsed);
    } catch {
      logger.warn('ScoreManager', 'localStorage の読み込みに失敗しました');
      return 0;
    }
  }

  private saveHighScore(score: number): void {
    try {
      localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, String(score));
    } catch {
      logger.warn('ScoreManager', 'localStorage への書き込みに失敗しました', { score });
    }
  }
}
