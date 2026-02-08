# 詳細設計書: cc_tapgame

| 項目 | 内容 |
|------|------|
| ドキュメントバージョン | 1.0 |
| 作成日 | 2026-02-08 |
| 対応要求仕様書 | docs/requirements.md v1.0 |

---

## 1. ディレクトリ構成

```
src/
├── types/
│   └── index.ts                  # 共通型定義
├── config/
│   └── gameConfig.ts             # ゲーム設定定数
├── core/
│   ├── GameManager.ts            # ゲーム全体管理
│   ├── ScoreManager.ts           # スコア管理
│   └── TimerManager.ts           # タイマー管理
├── map/
│   ├── MapManager.ts             # マップ管理
│   ├── MapData.ts                # マップ定義データ
│   ├── IntersectionNode.ts       # 交差点ノード
│   └── Road.ts                   # 道路
├── vehicles/
│   ├── PlayerCar.ts              # プレーヤー車両
│   └── NpcBuggy.ts               # NPC車両
├── input/
│   └── InputHandler.ts           # 入力処理
├── judge/
│   └── IntersectionJudge.ts      # 交差点判定ロジック
├── camera/
│   └── CameraController.ts       # カメラ制御
├── ui/
│   ├── HudRenderer.tsx           # HUD描画 (React)
│   └── EffectManager.ts          # エフェクト管理
├── logger/
│   └── Logger.ts                 # ログ出力
├── scenes/
│   ├── TitleScene.tsx            # タイトル画面
│   ├── GameScene.tsx             # ゲーム本編画面
│   └── GameOverScene.tsx         # ゲームオーバー画面
├── App.tsx                       # ルートコンポーネント
└── main.tsx                      # エントリーポイント
```

---

## 2. 共通型定義 (`types/index.ts`)

### 2.1 方向型

```typescript
/** プレーヤーが選択可能な進行方向 */
type Direction = 'left' | 'straight' | 'right';
```

### 2.2 ゲーム状態型

```typescript
/** 画面遷移の状態 */
type GameState = 'title' | 'playing' | 'gameover';
```

### 2.3 交差点種別型

```typescript
/** 交差点の形状 */
type IntersectionType = 'cross' | 't-junction';
```

### 2.4 ランドマーク型

```typescript
/** マップ上のランドマーク種別 */
type LandmarkType =
  | 'lookoutTower'
  | 'cityHall'
  | 'beach'
  | 'lighthouse'
  | 'farm'
  | 'playground'
  | 'museum'
  | 'racetrack';
```

### 2.5 ログレベル型

```typescript
/** ログの深刻度レベル */
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
```

### 2.6 環境型

```typescript
/** 実行環境 */
type Environment = 'development' | 'staging' | 'production';
```

### 2.7 ベクトル型

```typescript
/** 3D座標 */
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** 2D座標 (画面上の位置) */
interface Vector2 {
  x: number;
  y: number;
}
```

### 2.8 交差点ルート型

```typescript
/** 交差点での進行可能ルート */
interface RouteOption {
  /** 進行方向 */
  direction: Direction;
  /** 進行先の交差点ID */
  nextIntersectionId: string;
  /** 使用する道路ID */
  roadId: string;
}

/** 特定の道路から交差点に進入した場合の選択肢 */
interface IntersectionApproach {
  /** 進入元の道路ID */
  fromRoadId: string;
  /** 利用可能なルート一覧 */
  availableRoutes: RouteOption[];
}
```

### 2.9 交差点判定結果型

```typescript
/** 交差点での判定結果 */
interface JudgeResult {
  /** 正解かどうか */
  isCorrect: boolean;
  /** プレーヤーが選択した方向 */
  playerDirection: Direction;
  /** NPCが選択した正解の方向 */
  correctDirection: Direction;
  /** 判定が行われた交差点ID */
  intersectionId: string;
}
```

### 2.10 入力イベント型

```typescript
/** プレーヤーの入力イベント */
interface PlayerInput {
  /** 選択された方向 */
  direction: Direction;
  /** 入力時刻 (ゲーム内タイムスタンプ, 秒) */
  timestamp: number;
}
```

### 2.11 スコアメッセージ型

```typescript
/** ゲームオーバー時のメッセージ定義 */
interface ScoreMessage {
  /** 最小スコア (この値以上) */
  minScore: number;
  /** 最大スコア (この値未満, null = 上限なし) */
  maxScore: number | null;
  /** 表示メッセージ */
  message: string;
}
```

---

## 3. ゲーム設定定数 (`config/gameConfig.ts`)

```typescript
/** ゲーム全体の設定定数 */
const GAME_CONFIG = {
  /** ゲーム制限時間 (秒) */
  GAME_DURATION_SEC: 60,

  /** 車両速度 (km/h 相当の内部単位) */
  VEHICLE_SPEED: 20,

  /** NPC とプレーヤーの距離 (内部単位) */
  NPC_LEAD_DISTANCE: 15,

  /** 交差点の方向指示表示開始時間 (交差点到達前の秒数) */
  DIRECTION_SHOW_SEC: 3.0,

  /** 入力締め切り時間 (交差点到達前の秒数) */
  INPUT_DEADLINE_SEC: 0.1,

  /** 不正解時のスピン所要時間 (秒) */
  SPIN_DURATION_SEC: 1.0,

  /** 正解時のエフェクト表示時間 (秒) */
  CORRECT_EFFECT_DURATION_SEC: 1.0,

  /** 正解時の加算スコア */
  CORRECT_SCORE: 1,

  /** 方向指示アイコンの点滅間隔 (秒) */
  BLINK_INTERVAL_SEC: 0.3,

  /** スピンの回転角度 (度) */
  SPIN_ROTATION_DEG: 360,

  /** 星エフェクトの星の数 */
  STAR_EFFECT_COUNT: 12,

  /** localStorage のキー名 */
  HIGH_SCORE_KEY: 'cc_tapgame_highScore',
} as const;

/** カメラの設定 */
const CAMERA_CONFIG = {
  /** カメラのプレーヤー後方距離 */
  FOLLOW_DISTANCE: 10,
  /** カメラの高さ */
  HEIGHT: 6,
  /** カメラの注視点オフセット (前方) */
  LOOK_AHEAD: 5,
  /** カメラ追従の補間係数 (0〜1, 小さいほど滑らか) */
  LERP_FACTOR: 0.05,
} as const;

/** スコアに応じたメッセージ定義 */
const SCORE_MESSAGES: readonly ScoreMessage[] = [
  { minScore: 0,  maxScore: 10,   message: 'よく頑張ったね！' },
  { minScore: 10, maxScore: 20,   message: 'すごいすごい！！' },
  { minScore: 20, maxScore: null,  message: 'キミもパウパトロールにならない？！！' },
] as const;
```

---

## 4. クラス設計

### 4.1 GameManager (ゲーム全体管理)

**責務**: ゲームの状態遷移、各モジュールの初期化・更新・破棄を統括する。

```typescript
class GameManager {
  // ── フィールド ──
  private gameState: GameState;
  private scoreManager: ScoreManager;
  private timerManager: TimerManager;
  private mapManager: MapManager;
  private playerCar: PlayerCar;
  private npcBuggy: NpcBuggy;
  private inputHandler: InputHandler;
  private intersectionJudge: IntersectionJudge;
  private cameraController: CameraController;
  private effectManager: EffectManager;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null;

  // ── メソッド ──

  /** ゲームを初期化する */
  initialize(): void;

  /** ゲームループ (requestAnimationFrame から呼ばれる) */
  update(deltaTime: number): void;

  /** ゲーム状態を変更する */
  changeState(newState: GameState): void;

  /** ゲームを開始する (title → playing) */
  startGame(): void;

  /** ゲームを終了する (playing → gameover) */
  endGame(): void;

  /** タイトル画面に戻る (gameover → title) */
  returnToTitle(): void;

  /** リソースを解放する */
  dispose(): void;
}
```

**状態遷移図**:
```
         startGame()         endGame()
title ──────────────▶ playing ──────────────▶ gameover
  ▲                                              │
  └──────────── returnToTitle() ◀────────────────┘
```

---

### 4.2 ScoreManager (スコア管理)

**責務**: 現在スコアの加算、ハイスコアの読み書きを管理する。

```typescript
class ScoreManager {
  // ── フィールド ──
  private currentScore: number;     // 現在のスコア (初期値: 0)
  private highScore: number;        // ハイスコア (localStorageから読み込み)

  // ── メソッド ──

  /** スコアをリセットする (ゲーム開始時) */
  reset(): void;

  /** 正解時にスコアを加算する (+1) */
  addScore(): void;

  /** 現在のスコアを取得する */
  getCurrentScore(): number;

  /** ハイスコアを取得する */
  getHighScore(): number;

  /** ハイスコアを更新し localStorage に保存する */
  updateHighScore(): void;

  /**
   * スコアに応じたメッセージを取得する
   * @returns スコアメッセージ文字列
   *   0〜9: 'よく頑張ったね！'
   *   10〜19: 'すごいすごい！！'
   *   20〜: 'キミもパウパトロールにならない？！！'
   */
  getScoreMessage(): string;

  /** localStorage からハイスコアを読み込む */
  private loadHighScore(): number;

  /** localStorage にハイスコアを保存する */
  private saveHighScore(score: number): void;
}
```

**制約**:
- `currentScore` は `0` 以上の整数。負の値にはならない
- `addScore()` は `GAME_CONFIG.CORRECT_SCORE` (= 1) を加算する
- `loadHighScore()` で localStorage の値が不正 (NaN, 負値, 非数値文字列) の場合は `0` を返す

---

### 4.3 TimerManager (タイマー管理)

**責務**: ゲームの残り時間を管理し、制限時間経過時にコールバックを発火する。

```typescript
class TimerManager {
  // ── フィールド ──
  private remainingTime: number;                // 残り時間 (秒, 初期値: 60.0)
  private isRunning: boolean;                   // タイマー動作中フラグ
  private onTimeUp: (() => void) | null;        // 時間切れコールバック

  // ── メソッド ──

  /** タイマーをリセットする (GAME_DURATION_SEC にセット) */
  reset(): void;

  /** タイマーを開始する */
  start(): void;

  /** タイマーを停止する */
  stop(): void;

  /**
   * フレームごとの更新
   * @param deltaTime - 前フレームからの経過時間 (秒)
   */
  update(deltaTime: number): void;

  /** 残り時間を取得する (秒) */
  getRemainingTime(): number;

  /**
   * 表示用の残り時間文字列を取得する
   * @returns "MM:SS" 形式の文字列 (例: "00:45")
   */
  getDisplayTime(): string;

  /** 時間切れコールバックを登録する */
  setOnTimeUp(callback: () => void): void;
}
```

**制約**:
- `remainingTime` は `0.0` 以上 `GAME_CONFIG.GAME_DURATION_SEC` 以下
- `update()` で `remainingTime` が `0` 以下になった場合、`0` にクランプし `onTimeUp` を1度だけ呼ぶ
- `getDisplayTime()` は `remainingTime` を切り上げて整数化してフォーマットする
- `deltaTime` が負の値や極端に大きい値 (> 1秒) の場合はクランプする

---

### 4.4 MapManager (マップ管理)

**責務**: マップデータの保持、交差点・道路の管理、Three.js の3Dオブジェクト生成。

```typescript
class MapManager {
  // ── フィールド ──
  private intersections: Map<string, IntersectionNode>;
  private roads: Map<string, Road>;
  private mapGroup: THREE.Group;   // マップ全体の3Dグループ

  // ── メソッド ──

  /** マップデータを読み込み、3Dオブジェクトを生成する */
  initialize(scene: THREE.Scene): void;

  /** 交差点IDで交差点を取得する */
  getIntersection(id: string): IntersectionNode | undefined;

  /** 道路IDで道路を取得する */
  getRoad(id: string): Road | undefined;

  /** すべての交差点を取得する */
  getAllIntersections(): IntersectionNode[];

  /**
   * 指定の道路から交差点に進入した場合の進行可能ルートを取得する
   * @param intersectionId - 交差点ID
   * @param fromRoadId - 進入元の道路ID
   * @returns 進行可能なルートの配列
   */
  getAvailableRoutes(intersectionId: string, fromRoadId: string): RouteOption[];

  /**
   * 指定の道路上の位置が交差点までどれだけ離れているかを計算する
   * @param roadId - 現在の道路ID
   * @param positionOnRoad - 道路上の位置 (0.0〜1.0)
   * @param targetIntersectionId - 目標交差点ID
   * @returns 交差点までの残り距離 (内部単位)
   */
  getDistanceToIntersection(roadId: string, positionOnRoad: number, targetIntersectionId: string): number;

  /** リソースを解放する */
  dispose(): void;
}
```

---

### 4.5 IntersectionNode (交差点ノード)

**責務**: 個々の交差点の情報を保持する。

```typescript
class IntersectionNode {
  // ── フィールド ──
  readonly id: string;                              // 一意の交差点ID (例: "INT_01")
  readonly position: Vector3;                        // 3D空間上の位置
  readonly type: IntersectionType;                   // 'cross' | 't-junction'
  readonly approaches: readonly IntersectionApproach[];  // 進入方向ごとのルート情報
  readonly landmark: LandmarkType | null;            // 隣接するランドマーク (なければ null)

  // ── メソッド ──

  /**
   * 指定方向から進入した場合の進行可能な方向一覧を返す
   * @param fromRoadId - 進入元の道路ID
   * @returns Direction[] (例: ['left', 'right'] for T字路)
   */
  getAvailableDirections(fromRoadId: string): Direction[];

  /**
   * 指定方向から進入し、指定方向に進んだ場合の次の道路IDと交差点IDを返す
   * @param fromRoadId - 進入元の道路ID
   * @param direction - 選択した方向
   * @returns RouteOption | undefined (進行不可な方向の場合 undefined)
   */
  getRoute(fromRoadId: string, direction: Direction): RouteOption | undefined;
}
```

**制約**:
- `id` は空文字列不可、一意であること
- `approaches` は最低1つ以上の要素を持つ
- 十字路 (`cross`) の場合、各 approach の `availableRoutes` は3方向
- T字路 (`t-junction`) の場合、各 approach の `availableRoutes` は2方向

---

### 4.6 Road (道路)

**責務**: 2つの交差点を結ぶ道路の情報を保持する。

```typescript
class Road {
  // ── フィールド ──
  readonly id: string;                    // 一意の道路ID (例: "ROAD_01")
  readonly startIntersectionId: string;    // 始点の交差点ID
  readonly endIntersectionId: string;      // 終点の交差点ID
  readonly waypoints: readonly Vector3[];  // 道路の経路点 (始点から終点へ順序付き)
  readonly length: number;                 // 道路の全長 (内部単位)

  // ── メソッド ──

  /**
   * 道路上の位置を進行率から3D座標に変換する
   * @param progress - 進行率 (0.0 = 始点, 1.0 = 終点)
   * @returns 3D座標
   */
  getPositionAtProgress(progress: number): Vector3;

  /**
   * 道路上の位置における進行方向ベクトルを取得する
   * @param progress - 進行率 (0.0〜1.0)
   * @returns 正規化された方向ベクトル
   */
  getDirectionAtProgress(progress: number): Vector3;

  /**
   * 反対側の交差点IDを返す
   * @param fromIntersectionId - 片方の交差点ID
   * @returns 反対側の交差点ID
   */
  getOppositeIntersectionId(fromIntersectionId: string): string;
}
```

**制約**:
- `waypoints` は最低2点 (始点と終点) を持つ
- `progress` は `0.0` 以上 `1.0` 以下。範囲外はクランプ
- `length` は `0` より大きい正の数

---

### 4.7 PlayerCar (プレーヤー車両)

**責務**: プレーヤーのパトカーの位置・回転・状態を管理する。

```typescript
class PlayerCar {
  // ── フィールド ──
  private position: Vector3;                  // 現在の3D位置
  private rotation: number;                   // Y軸回転角 (ラジアン)
  private currentRoadId: string;              // 現在走行中の道路ID
  private currentProgress: number;            // 道路上の進行率 (0.0〜1.0)
  private targetIntersectionId: string;       // 次に到達する交差点ID
  private isSpinning: boolean;                // スピン中フラグ
  private spinElapsed: number;                // スピン経過時間 (秒)
  private spinStartRotation: number;          // スピン開始時のZ軸回転角
  private mesh: THREE.Group;                  // 3Dモデル

  // ── メソッド ──

  /** 初期位置にリセットする */
  reset(startRoadId: string, startProgress: number, startIntersectionId: string): void;

  /**
   * フレームごとの更新
   * @param deltaTime - 前フレームからの経過時間 (秒)
   * @param road - 現在走行中の道路
   */
  update(deltaTime: number, road: Road): void;

  /** スピンアニメーションを開始する */
  startSpin(): void;

  /** スピン中かどうかを返す */
  getIsSpinning(): boolean;

  /** 現在走行中の道路IDを取得する */
  getCurrentRoadId(): string;

  /** 道路上の進行率を取得する */
  getCurrentProgress(): number;

  /** 次に到達する交差点IDを取得する */
  getTargetIntersectionId(): string;

  /** 3D位置を取得する */
  getPosition(): Vector3;

  /** Y軸回転角を取得する (ラジアン) */
  getRotation(): number;

  /**
   * 新しい道路に移動する (交差点通過後)
   * @param roadId - 新しい道路ID
   * @param targetIntersectionId - 次の交差点ID
   */
  enterRoad(roadId: string, targetIntersectionId: string): void;

  /** 3Dモデルのメッシュを取得する */
  getMesh(): THREE.Group;
}
```

**制約**:
- `currentProgress` は `0.0` 以上 `1.0` 以下
- `isSpinning` が `true` の間は位置更新を行わない
- `spinElapsed` が `GAME_CONFIG.SPIN_DURATION_SEC` を超えたらスピン終了
- スピン中のZ軸回転: `spinStartRotation + (spinElapsed / SPIN_DURATION_SEC) * 2π`

---

### 4.8 NpcBuggy (NPC車両)

**責務**: NPCバギーの自律走行、交差点でのランダム方向選択を管理する。

```typescript
class NpcBuggy {
  // ── フィールド ──
  private position: Vector3;
  private rotation: number;
  private currentRoadId: string;
  private currentProgress: number;
  private targetIntersectionId: string;
  private chosenDirection: Direction | null;    // 次の交差点で選択した方向
  private mesh: THREE.Group;

  // ── メソッド ──

  /** 初期位置にリセットする */
  reset(startRoadId: string, startProgress: number, startIntersectionId: string): void;

  /**
   * フレームごとの更新
   * @param deltaTime - 前フレームからの経過時間 (秒)
   * @param road - 現在走行中の道路
   */
  update(deltaTime: number, road: Road): void;

  /**
   * 次の交差点でのランダム方向を決定する
   * @param availableDirections - 進行可能な方向一覧
   * @returns 選択された方向
   */
  decideDirection(availableDirections: Direction[]): Direction;

  /** 現在選択中の方向を取得する (判定用) */
  getChosenDirection(): Direction | null;

  /** 新しい道路に移動する */
  enterRoad(roadId: string, targetIntersectionId: string): void;

  /** 3D位置を取得する */
  getPosition(): Vector3;

  /** 3Dモデルのメッシュを取得する */
  getMesh(): THREE.Group;
}
```

**制約**:
- `decideDirection()` は `availableDirections` が空の場合エラーをスローする
- ランダム選択は `Math.random()` を使用し、均等確率で選択する
- NPCは常にプレーヤーの `GAME_CONFIG.NPC_LEAD_DISTANCE` 分前方に位置する

---

### 4.9 InputHandler (入力処理)

**責務**: タッチ入力・キーボード入力を統一的に処理し、方向選択イベントを発火する。

```typescript
class InputHandler {
  // ── フィールド ──
  private isEnabled: boolean;                          // 入力受付フラグ
  private lastInput: PlayerInput | null;               // 最後の入力
  private onDirectionInput: ((input: PlayerInput) => void) | null;

  // ── メソッド ──

  /** イベントリスナーを登録する */
  initialize(container: HTMLElement): void;

  /** 入力受付を有効にする */
  enable(): void;

  /** 入力受付を無効にする (スピン中等) */
  disable(): void;

  /** 最後の入力をクリアする (交差点通過後) */
  clearLastInput(): void;

  /** 最後の入力を取得する */
  getLastInput(): PlayerInput | null;

  /** 入力コールバックを登録する */
  setOnDirectionInput(callback: (input: PlayerInput) => void): void;

  /**
   * タッチイベントから方向を判定する
   * @param touchX - タッチX座標 (px)
   * @param screenWidth - 画面幅 (px)
   * @returns 判定された方向
   */
  private resolveTouchDirection(touchX: number, screenWidth: number): Direction;

  /**
   * キーボードイベントから方向を判定する
   * @param key - 押されたキー名
   * @returns 判定された方向、または null (対応外キー)
   */
  private resolveKeyDirection(key: string): Direction | null;

  /** イベントリスナーを解除する */
  dispose(): void;
}
```

**タッチ判定ロジック**:
```
screenWidth = 画面幅
touchX = タッチX座標

if touchX < screenWidth / 3       → 'left'
if touchX < screenWidth * 2 / 3   → 'straight'
otherwise                          → 'right'
```

**キーボードマッピング**:
| キー | 方向 |
|------|------|
| `ArrowLeft`, `a`, `A` | `left` |
| `ArrowUp`, `w`, `W` | `straight` |
| `ArrowRight`, `d`, `D` | `right` |

**制約**:
- `isEnabled` が `false` の場合、入力イベントを無視する
- `resolveTouchDirection()` の `screenWidth` が `0` 以下の場合はエラーをスローする
- `touchX` が負値の場合は `'left'`、`screenWidth` 以上の場合は `'right'` として処理する

---

### 4.10 IntersectionJudge (交差点判定ロジック)

**責務**: 交差点への接近検知、方向指示UI表示タイミング管理、正解/不正解の判定。

```typescript
class IntersectionJudge {
  // ── フィールド ──
  private isApproaching: boolean;             // 交差点接近中フラグ
  private timeToIntersection: number;         // 交差点到達までの残り時間 (秒)
  private isInputLocked: boolean;             // 入力締め切り済みフラグ
  private availableDirections: Direction[];   // 現在の交差点で可能な方向一覧

  // ── メソッド ──

  /**
   * フレームごとの更新
   * @param distanceToIntersection - 交差点までの残り距離 (内部単位)
   * @param speed - 現在の速度 (内部単位/秒)
   */
  update(distanceToIntersection: number, speed: number): void;

  /** 交差点に接近中かどうかを返す (3秒以内) */
  getIsApproaching(): boolean;

  /** 入力締め切り済みかどうかを返す (0.1秒以内) */
  getIsInputLocked(): boolean;

  /** 交差点到達までの残り時間を取得する */
  getTimeToIntersection(): number;

  /** 現在の交差点で可能な方向一覧を取得する */
  getAvailableDirections(): Direction[];

  /** 進行可能な方向を設定する */
  setAvailableDirections(directions: Direction[]): void;

  /**
   * 判定を実行する
   * @param playerInput - プレーヤーの入力 (null の場合はデフォルト直進)
   * @param npcDirection - NPCが選んだ正解の方向
   * @param intersectionId - 判定対象の交差点ID
   * @returns 判定結果
   */
  judge(
    playerInput: PlayerInput | null,
    npcDirection: Direction,
    intersectionId: string
  ): JudgeResult;

  /** 判定状態をリセットする (交差点通過後) */
  resetState(): void;
}
```

**判定ロジック**:
```
if playerInput === null:
  playerDirection = 'straight' (デフォルト)
else:
  playerDirection = playerInput.direction

if T字路 かつ playerDirection === 'straight' かつ 'straight' が availableDirections にない:
  isCorrect = false
else:
  isCorrect = (playerDirection === npcDirection)
```

**制約**:
- `timeToIntersection` は `speed > 0` の場合のみ計算。`speed <= 0` の場合は更新しない
- `isApproaching` は `timeToIntersection <= DIRECTION_SHOW_SEC` の場合 `true`
- `isInputLocked` は `timeToIntersection <= INPUT_DEADLINE_SEC` の場合 `true`

---

### 4.11 CameraController (カメラ制御)

**責務**: 3人称視点カメラの位置・回転をプレーヤー車両に追従させる。

```typescript
class CameraController {
  // ── フィールド ──
  private camera: THREE.PerspectiveCamera;
  private targetPosition: Vector3;    // 目標位置
  private targetLookAt: Vector3;      // 目標注視点

  // ── メソッド ──

  /** カメラを初期化する */
  initialize(aspect: number): void;

  /**
   * フレームごとの更新
   * @param playerPosition - プレーヤーの3D位置
   * @param playerRotation - プレーヤーのY軸回転角 (ラジアン)
   */
  update(playerPosition: Vector3, playerRotation: number): void;

  /** ウィンドウリサイズ時にアスペクト比を更新する */
  onResize(width: number, height: number): void;

  /** THREE.Camera インスタンスを取得する */
  getCamera(): THREE.PerspectiveCamera;
}
```

**カメラ位置の算出**:
```
offset.x = -sin(playerRotation) * CAMERA_CONFIG.FOLLOW_DISTANCE
offset.y = CAMERA_CONFIG.HEIGHT
offset.z = -cos(playerRotation) * CAMERA_CONFIG.FOLLOW_DISTANCE

targetPosition = playerPosition + offset
targetLookAt = playerPosition + forward * CAMERA_CONFIG.LOOK_AHEAD

// 線形補間でスムーズに追従
camera.position = lerp(camera.position, targetPosition, CAMERA_CONFIG.LERP_FACTOR)
camera.lookAt(lerp(currentLookAt, targetLookAt, CAMERA_CONFIG.LERP_FACTOR))
```

---

### 4.12 EffectManager (エフェクト管理)

**責務**: 正解時の星キラキラエフェクト、テキストエフェクトの再生・管理。

```typescript
class EffectManager {
  // ── フィールド ──
  private activeEffects: Effect[];
  private container: HTMLElement;

  // ── メソッド ──

  /** 正解エフェクトを再生する (星 + "Great!") */
  playCorrectEffect(): void;

  /**
   * フレームごとの更新 (アニメーション進行)
   * @param deltaTime - 前フレームからの経過時間 (秒)
   */
  update(deltaTime: number): void;

  /** すべてのアクティブエフェクトをクリアする */
  clearAll(): void;

  /** リソースを解放する */
  dispose(): void;
}

/** エフェクトの内部表現 */
interface Effect {
  /** エフェクト種別 */
  type: 'star' | 'text';
  /** 経過時間 (秒) */
  elapsed: number;
  /** 表示時間 (秒) */
  duration: number;
  /** DOM要素 */
  element: HTMLElement;
  /** 星の場合: 飛散方向角度 (ラジアン) */
  angle?: number;
  /** 星の場合: 飛散速度 */
  speed?: number;
}
```

**星エフェクトの仕様**:
- 星の数: `GAME_CONFIG.STAR_EFFECT_COUNT` (12個)
- 各星の飛散角度: `(index / STAR_EFFECT_COUNT) * 2π` (均等に放射)
- 表示時間: `GAME_CONFIG.CORRECT_EFFECT_DURATION_SEC` (1秒)
- アニメーション: 中央から外側に移動しながらフェードアウト

---

### 4.13 HudRenderer (HUD描画)

**責務**: React コンポーネントとして、ゲーム中のHUD要素を描画する。

```typescript
/** HUD の props */
interface HudProps {
  /** 残り時間の表示文字列 ("MM:SS") */
  displayTime: string;
  /** 現在のスコア */
  score: number;
  /** 交差点に接近中か */
  isApproaching: boolean;
  /** 進行可能な方向一覧 */
  availableDirections: Direction[];
  /** 入力済み方向 (ハイライト用) */
  selectedDirection: Direction | null;
}

const HudRenderer: React.FC<HudProps>;
```

**方向指示アイコンの表示ルール**:
- `isApproaching === true` の場合のみ表示
- `availableDirections` に含まれる方向のみアイコンを表示
- 表示中は `GAME_CONFIG.BLINK_INTERVAL_SEC` (0.3秒) 間隔で点滅
- `selectedDirection` に一致するアイコンはハイライト表示

---

### 4.14 Logger (ログ出力)

**責務**: CLAUDE.md のログ統一ルールに準拠したログ出力を行う。

```typescript
class Logger {
  // ── フィールド ──
  private environment: Environment;
  private minLevel: LogLevel;

  // ── メソッド ──

  /** ログ出力 (共通) */
  private log(level: LogLevel, module: string, message: string, context?: Record<string, unknown>): void;

  /** DEBUG レベルのログ出力 */
  debug(module: string, message: string, context?: Record<string, unknown>): void;

  /** INFO レベルのログ出力 */
  info(module: string, message: string, context?: Record<string, unknown>): void;

  /** WARN レベルのログ出力 */
  warn(module: string, message: string, context?: Record<string, unknown>): void;

  /** ERROR レベルのログ出力 */
  error(module: string, message: string, context?: Record<string, unknown>): void;

  /** FATAL レベルのログ出力 */
  fatal(module: string, message: string, context?: Record<string, unknown>): void;
}
```

**出力フォーマット**:
```
[2026-02-08T15:30:00.000+09:00] [INFO] [GameEngine] ゲーム開始 {"score":0,"timeLimit":60}
```

**レベルフィルタ**:
| 環境 | 最小レベル |
|------|-----------|
| development | DEBUG |
| staging | INFO |
| production | INFO |

---

## 5. マップデータ定義 (`map/MapData.ts`)

### 5.1 交差点定義

```typescript
/** マップ上の交差点一覧 */
const INTERSECTION_DEFINITIONS: IntersectionDefinition[] = [
  { id: 'INT_01', position: { x: 0,   y: 0, z: -80 }, type: 't-junction',  landmark: 'lookoutTower' },
  { id: 'INT_02', position: { x: -40, y: 0, z: -60 }, type: 'cross',       landmark: 'farm' },
  { id: 'INT_03', position: { x: 40,  y: 0, z: -60 }, type: 'cross',       landmark: 'cityHall' },
  { id: 'INT_04', position: { x: -60, y: 0, z: -20 }, type: 't-junction',  landmark: null },
  { id: 'INT_05', position: { x: 60,  y: 0, z: -20 }, type: 't-junction',  landmark: 'beach' },
  { id: 'INT_06', position: { x: -40, y: 0, z: 0 },   type: 'cross',       landmark: 'playground' },
  { id: 'INT_07', position: { x: 40,  y: 0, z: 0 },   type: 'cross',       landmark: null },
  { id: 'INT_08', position: { x: -60, y: 0, z: 40 },  type: 't-junction',  landmark: 'museum' },
  { id: 'INT_09', position: { x: 60,  y: 0, z: 40 },  type: 't-junction',  landmark: 'lighthouse' },
  { id: 'INT_10', position: { x: 0,   y: 0, z: 60 },  type: 't-junction',  landmark: 'racetrack' },
];
```

### 5.2 道路定義

```typescript
/** マップ上の道路一覧 */
const ROAD_DEFINITIONS: RoadDefinition[] = [
  // 外周ループ (時計回り)
  { id: 'ROAD_01', start: 'INT_01', end: 'INT_03' },  // タワー → 市庁舎
  { id: 'ROAD_02', start: 'INT_03', end: 'INT_05' },  // 市庁舎 → ビーチ
  { id: 'ROAD_03', start: 'INT_05', end: 'INT_07' },  // ビーチ → 右中央
  { id: 'ROAD_04', start: 'INT_07', end: 'INT_09' },  // 右中央 → 灯台
  { id: 'ROAD_05', start: 'INT_09', end: 'INT_10' },  // 灯台 → レース場
  { id: 'ROAD_06', start: 'INT_10', end: 'INT_08' },  // レース場 → 博物館
  { id: 'ROAD_07', start: 'INT_08', end: 'INT_04' },  // 博物館 → 左中央
  { id: 'ROAD_08', start: 'INT_04', end: 'INT_06' },  // 左中央 → プレイグラウンド
  { id: 'ROAD_09', start: 'INT_06', end: 'INT_02' },  // プレイグラウンド → 農場
  { id: 'ROAD_10', start: 'INT_02', end: 'INT_01' },  // 農場 → タワー

  // 内部道路
  { id: 'ROAD_11', start: 'INT_02', end: 'INT_03' },  // 農場 ↔ 市庁舎
  { id: 'ROAD_12', start: 'INT_06', end: 'INT_07' },  // プレイグラウンド ↔ 右中央
  { id: 'ROAD_13', start: 'INT_08', end: 'INT_09' },  // 博物館 ↔ 灯台
];
```

### 5.3 マップ構造図 (交差点ID付き)

```
              INT_01 (ルックアウトタワー, T字路)
               / \
       ROAD_10/   \ROAD_01
             /     \
   INT_02 ●─────────● INT_03
   (農場)   ROAD_11   (市庁舎)
     │                  │
  ROAD_09             ROAD_02
     │                  │
   INT_04 ●          ● INT_05 (ビーチ)
     │                  │
  ROAD_08             ROAD_03
     │                  │
   INT_06 ●─────────● INT_07
  (公園)   ROAD_12      │
     │                ROAD_04
  ROAD_07               │
     │                  │
   INT_08 ●─────────● INT_09 (灯台)
  (博物館)  ROAD_13      │
     │                ROAD_05
  ROAD_06               │
       \             /
        \  ROAD_05  /
         \       /
         INT_10 (レース場, T字路)
```

---

## 6. React コンポーネント構成

```
App
├── TitleScene              # タイトル画面
│   ├── Logo                # オマージュロゴ (SVG)
│   └── StartButton         # スタートボタン
├── GameScene               # ゲーム本編
│   ├── ThreeCanvas         # Three.js 描画領域
│   ├── HudRenderer         # HUDオーバーレイ
│   │   ├── Timer           # タイマー表示
│   │   ├── ScoreDisplay    # スコア表示
│   │   └── DirectionIcons  # 方向指示アイコン
│   ├── EffectOverlay       # エフェクトレイヤー
│   └── TapArea             # タップ入力領域
└── GameOverScene           # ゲームオーバー画面
    ├── FinalScore          # 最終スコア表示
    ├── ScoreMessage        # スコア別メッセージ
    └── RetryButton         # リトライボタン
```

---

## 7. ゲームループ設計

### 7.1 メインループ (GameManager.update)

```
update(deltaTime):
  1. TimerManager.update(deltaTime)
     → 残り時間が 0 になったら endGame()

  2. NpcBuggy.update(deltaTime, currentRoad)
     → NPC が交差点に到達したら方向を決定し次の道路へ

  3. IntersectionJudge.update(distanceToIntersection, speed)
     → 3秒前になったら isApproaching = true
     → 0.1秒前になったら isInputLocked = true

  4. if 交差点到達:
     a. judge() で判定実行
     b. 正解: ScoreManager.addScore(), EffectManager.playCorrectEffect()
     c. 不正解: PlayerCar.startSpin()
     d. InputHandler.clearLastInput()
     e. IntersectionJudge.resetState()
     f. PlayerCar.enterRoad(正解の道路)

  5. if !PlayerCar.isSpinning:
     PlayerCar.update(deltaTime, currentRoad)

  6. CameraController.update(playerPosition, playerRotation)

  7. EffectManager.update(deltaTime)

  8. renderer.render(scene, camera)
```

### 7.2 deltaTime の計算

```typescript
const MAX_DELTA_TIME = 0.1;  // 最大deltaTime (秒), フレーム落ち対策

let lastTime = performance.now();

function gameLoop(currentTime: number): void {
  const rawDelta = (currentTime - lastTime) / 1000;
  const deltaTime = Math.min(rawDelta, MAX_DELTA_TIME);
  lastTime = currentTime;

  gameManager.update(deltaTime);
  requestAnimationFrame(gameLoop);
}
```

---

## 8. エラーハンドリング方針

| 箇所 | エラー種別 | 対応 |
|------|-----------|------|
| localStorage 読み込み | データ破損 / パース失敗 | デフォルト値 (0) を使用。WARN ログ出力 |
| localStorage 書き込み | 容量超過 / 権限なし | エラーを握りつぶし、WARN ログ出力。ゲームプレイには影響させない |
| Three.js レンダラー初期化 | WebGL 非対応 | エラーメッセージを画面に表示し、ゲームを開始しない。ERROR ログ出力 |
| マップデータ整合性 | 交差点/道路IDの不一致 | 初期化時にバリデーション。不整合があれば FATAL ログ出力しゲームを停止 |
| 交差点ルート検索 | 存在しないIDの指定 | undefined を返し、呼び出し元で不正解扱いにする。ERROR ログ出力 |
| deltaTime 異常値 | 負値 / 極端に大きい値 | 0〜MAX_DELTA_TIME にクランプ |
