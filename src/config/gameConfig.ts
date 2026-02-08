import type { ScoreMessage } from '../types/index.ts';

/** ゲーム全体の設定定数 */
export const GAME_CONFIG = {
  GAME_DURATION_SEC: 60,
  VEHICLE_SPEED: 20,
  NPC_LEAD_DISTANCE: 15,
  DIRECTION_SHOW_SEC: 3.0,
  INPUT_DEADLINE_SEC: 0.1,
  SPIN_DURATION_SEC: 1.0,
  CORRECT_EFFECT_DURATION_SEC: 1.0,
  CORRECT_SCORE: 1,
  BLINK_INTERVAL_SEC: 0.3,
  SPIN_ROTATION_DEG: 360,
  STAR_EFFECT_COUNT: 12,
  HIGH_SCORE_KEY: 'cc_tapgame_highScore',
  MAX_DELTA_TIME: 0.1,
} as const;

/** カメラの設定 */
export const CAMERA_CONFIG = {
  FOLLOW_DISTANCE: 10,
  HEIGHT: 6,
  LOOK_AHEAD: 5,
  LERP_FACTOR: 0.05,
} as const;

/** スコアに応じたメッセージ定義 */
export const SCORE_MESSAGES: readonly ScoreMessage[] = [
  { minScore: 0, maxScore: 10, message: 'よく頑張ったね！' },
  { minScore: 10, maxScore: 20, message: 'すごいすごい！！' },
  { minScore: 20, maxScore: null, message: 'キミもパウパトロールにならない？！！' },
] as const;
