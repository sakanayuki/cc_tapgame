/** プレーヤーが選択可能な進行方向 */
export type Direction = 'left' | 'straight' | 'right';

/** 画面遷移の状態 */
export type GameState = 'title' | 'playing' | 'gameover';

/** 交差点の形状 */
export type IntersectionType = 'cross' | 't-junction';

/** マップ上のランドマーク種別 */
export type LandmarkType =
  | 'lookoutTower'
  | 'cityHall'
  | 'beach'
  | 'lighthouse'
  | 'farm'
  | 'playground'
  | 'museum'
  | 'racetrack';

/** ログの深刻度レベル */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

/** 実行環境 */
export type Environment = 'development' | 'staging' | 'production';

/** 3D座標 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** 交差点での進行可能ルート */
export interface RouteOption {
  direction: Direction;
  nextIntersectionId: string;
  roadId: string;
}

/** 特定の道路から交差点に進入した場合の選択肢 */
export interface IntersectionApproach {
  fromRoadId: string;
  availableRoutes: RouteOption[];
}

/** 交差点での判定結果 */
export interface JudgeResult {
  isCorrect: boolean;
  playerDirection: Direction;
  correctDirection: Direction;
  intersectionId: string;
}

/** プレーヤーの入力イベント */
export interface PlayerInput {
  direction: Direction;
  timestamp: number;
}

/** ゲームオーバー時のメッセージ定義 */
export interface ScoreMessage {
  minScore: number;
  maxScore: number | null;
  message: string;
}

/** 交差点定義データ */
export interface IntersectionDefinition {
  id: string;
  position: Vector3;
  type: IntersectionType;
  landmark: LandmarkType | null;
}

/** 道路定義データ */
export interface RoadDefinition {
  id: string;
  start: string;
  end: string;
}
