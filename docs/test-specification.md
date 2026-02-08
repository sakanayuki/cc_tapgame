# テスト仕様書: cc_tapgame

| 項目 | 内容 |
|------|------|
| ドキュメントバージョン | 1.0 |
| 作成日 | 2026-02-08 |
| 対応詳細設計書 | docs/detailed-design.md v1.0 |
| テストフレームワーク | Vitest |
| カバレッジ目標 | 80% 以上 |

---

## 1. テスト方針

### 1.1 テスト分類

| 分類 | 対象 | ファイル命名 |
|------|------|-------------|
| ユニットテスト (UT) | 個々のクラス・関数の単体動作 | `*.test.ts` |
| 統合テスト (IT) | モジュール間連携 | `*.test.ts` (同ファイル内で分類) |
| コンポーネントテスト (CT) | React コンポーネント描画・操作 | `*.test.tsx` |

### 1.2 テストファイル配置

```
src/
├── core/
│   ├── ScoreManager.ts
│   ├── ScoreManager.test.ts        ← 同一ディレクトリ
│   ├── TimerManager.ts
│   └── TimerManager.test.ts
├── ...
```

### 1.3 共通テストヘルパー

```typescript
/** テスト用の PlayerInput 生成 */
function createPlayerInput(direction: Direction, timestamp?: number): PlayerInput;

/** テスト用の IntersectionNode 生成 (十字路) */
function createCrossIntersection(id: string): IntersectionNode;

/** テスト用の IntersectionNode 生成 (T字路) */
function createTJunctionIntersection(id: string, excludeDirection: Direction): IntersectionNode;

/** テスト用の Road 生成 */
function createRoad(id: string, startId: string, endId: string, length?: number): Road;

/** localStorage モック */
function mockLocalStorage(): { getItem: Mock; setItem: Mock; removeItem: Mock };
```

---

## 2. ScoreManager テスト

**テストファイル**: `src/core/ScoreManager.test.ts`

### 2.1 UT: reset()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| SM-001 | 初期状態でリセット | `new ScoreManager()` → `reset()` | `getCurrentScore() === 0` |
| SM-002 | スコア加算後にリセット | `addScore()` を5回呼出後に `reset()` | `getCurrentScore() === 0` |

### 2.2 UT: addScore()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| SM-010 | 1回加算 | `reset()` → `addScore()` | `getCurrentScore() === 1` |
| SM-011 | 連続加算 | `reset()` → `addScore()` x 10 | `getCurrentScore() === 10` |
| SM-012 | 大量加算 | `addScore()` x 100 | `getCurrentScore() === 100` |

### 2.3 UT: getScoreMessage() — 境界値テスト

| ID | テストケース | スコア | 期待メッセージ | 境界値分類 |
|----|------------|--------|--------------|-----------|
| SM-020 | 最小値 | 0 | `'よく頑張ったね！'` | 下限値 |
| SM-021 | 境界値直前 | 9 | `'よく頑張ったね！'` | 上限境界 -1 |
| SM-022 | 境界値 (10点ちょうど) | 10 | `'すごいすごい！！'` | 下限境界 |
| SM-023 | 中間値 | 15 | `'すごいすごい！！'` | 代表値 |
| SM-024 | 境界値直前 | 19 | `'すごいすごい！！'` | 上限境界 -1 |
| SM-025 | 境界値 (20点ちょうど) | 20 | `'キミもパウパトロールにならない？！！'` | 下限境界 |
| SM-026 | 高スコア | 50 | `'キミもパウパトロールにならない？！！'` | 上限なし代表値 |
| SM-027 | 極端な高スコア | 999 | `'キミもパウパトロールにならない？！！'` | 極大値 |

### 2.4 UT: updateHighScore()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| SM-030 | 初回ハイスコア更新 | localStorage 空, スコア 5 | localStorage に `5` が保存される |
| SM-031 | ハイスコア更新 (超えた場合) | 既存ハイスコア 10, 現在スコア 15 | localStorage に `15` が保存される |
| SM-032 | ハイスコア未更新 (超えない場合) | 既存ハイスコア 10, 現在スコア 5 | localStorage は `10` のまま |
| SM-033 | ハイスコアと同点 | 既存ハイスコア 10, 現在スコア 10 | localStorage は `10` のまま |

### 2.5 UT: loadHighScore() — 異常値テスト

| ID | テストケース | localStorage の値 | 期待結果 |
|----|------------|-------------------|---------|
| SM-040 | 正常値 | `'10'` | `10` |
| SM-041 | 値なし (null) | キーが存在しない | `0` |
| SM-042 | 空文字 | `''` | `0` |
| SM-043 | 非数値文字列 | `'abc'` | `0` |
| SM-044 | 負の数値 | `'-5'` | `0` |
| SM-045 | 小数 | `'3.7'` | `3` (切り捨て) |
| SM-046 | NaN文字列 | `'NaN'` | `0` |
| SM-047 | Infinity | `'Infinity'` | `0` |
| SM-048 | JSON オブジェクト | `'{"score":10}'` | `0` |
| SM-049 | 非常に大きい数値 | `'999999999999'` | `999999999999` (そのまま) |

### 2.6 UT: saveHighScore() — 異常値テスト

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| SM-050 | localStorage 書き込み例外 | `setItem` が例外をスロー | 例外がスローされない (握りつぶし)。WARN ログが出力される |

---

## 3. TimerManager テスト

**テストファイル**: `src/core/TimerManager.test.ts`

### 3.1 UT: reset()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| TM-001 | 初期リセット | `new TimerManager()` → `reset()` | `getRemainingTime() === 60.0` |
| TM-002 | 途中からリセット | 30秒経過後に `reset()` | `getRemainingTime() === 60.0` |

### 3.2 UT: update() — 正常系

| ID | テストケース | deltaTime | 前提 (remainingTime) | 期待結果 (remainingTime) |
|----|------------|-----------|---------------------|------------------------|
| TM-010 | 通常のフレーム更新 | 0.016 (≈60fps) | 60.0 | 59.984 |
| TM-011 | 1秒経過 | 1.0 | 60.0 | 59.0 |
| TM-012 | ちょうど0秒に到達 | 0.5 | 0.5 | 0.0, onTimeUp が1回呼ばれる |
| TM-013 | 0秒を通過 | 1.0 | 0.3 | 0.0 にクランプ, onTimeUp が1回呼ばれる |
| TM-014 | 停止中は更新しない | 0.016 | `stop()` 済み, 60.0 | 60.0 (変化なし) |

### 3.3 UT: update() — 境界値テスト

| ID | テストケース | deltaTime | 前提 | 期待結果 |
|----|------------|-----------|------|---------|
| TM-020 | deltaTime = 0 | 0.0 | 60.0 | 60.0 (変化なし) |
| TM-021 | deltaTime が負値 | -0.1 | 60.0 | 60.0 (0にクランプされ変化なし) |
| TM-022 | deltaTime が極大値 | 5.0 | 60.0 | 59.9 (MAX_DELTA_TIME=0.1にクランプ) |
| TM-023 | 残り時間が既に0 | 0.016 | 0.0 | 0.0, onTimeUp は呼ばれない (既に発火済み) |

### 3.4 UT: onTimeUp コールバック

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| TM-030 | コールバック発火は1度だけ | 残り0.05秒, update(0.1) を2回呼ぶ | onTimeUp は合計1回だけ呼ばれる |
| TM-031 | コールバック未登録 | onTimeUp = null, 残り0秒到達 | エラーがスローされない |

### 3.5 UT: getDisplayTime()

| ID | テストケース | remainingTime (秒) | 期待結果 |
|----|------------|-------------------|---------|
| TM-040 | 60秒 (最大) | 60.0 | `'01:00'` |
| TM-041 | 45.3秒 | 45.3 | `'00:46'` (切り上げ) |
| TM-042 | 9.99秒 | 9.99 | `'00:10'` (切り上げ) |
| TM-043 | 1.0秒 | 1.0 | `'00:01'` |
| TM-044 | 0.01秒 | 0.01 | `'00:01'` (切り上げ) |
| TM-045 | 0秒 (終了) | 0.0 | `'00:00'` |

---

## 4. InputHandler テスト

**テストファイル**: `src/input/InputHandler.test.ts`

### 4.1 UT: resolveTouchDirection() — 正常系

| ID | テストケース | touchX | screenWidth | 期待結果 |
|----|------------|--------|------------|---------|
| IH-001 | 左端タップ | 0 | 414 | `'left'` |
| IH-002 | 左領域の中間 | 69 | 414 | `'left'` |
| IH-003 | 左右境界 (左側) | 137 | 414 | `'left'` |
| IH-004 | 左右境界 (中央側) | 138 | 414 | `'straight'` |
| IH-005 | 中央の中間 | 207 | 414 | `'straight'` |
| IH-006 | 中右境界 (中央側) | 275 | 414 | `'straight'` |
| IH-007 | 中右境界 (右側) | 276 | 414 | `'right'` |
| IH-008 | 右端タップ | 413 | 414 | `'right'` |

### 4.2 UT: resolveTouchDirection() — 境界値テスト

| ID | テストケース | touchX | screenWidth | 期待結果 | 分類 |
|----|------------|--------|------------|---------|------|
| IH-010 | screenWidth/3 ちょうど | 138.0 | 414 | `'straight'` | 境界値 |
| IH-011 | screenWidth*2/3 ちょうど | 276.0 | 414 | `'right'` | 境界値 |
| IH-012 | 最小画面幅 (iPhone 11) | 0 | 414 | `'left'` | 最小幅 |

### 4.3 UT: resolveTouchDirection() — 異常値テスト

| ID | テストケース | touchX | screenWidth | 期待結果 |
|----|------------|--------|------------|---------|
| IH-020 | 負のタッチX | -10 | 414 | `'left'` |
| IH-021 | 画面幅を超えるタッチX | 500 | 414 | `'right'` |
| IH-022 | 画面幅が 0 | 100 | 0 | エラーがスローされる |
| IH-023 | 画面幅が負値 | 100 | -414 | エラーがスローされる |

### 4.4 UT: resolveKeyDirection()

| ID | テストケース | key | 期待結果 |
|----|------------|-----|---------|
| IH-030 | ArrowLeft | `'ArrowLeft'` | `'left'` |
| IH-031 | 小文字 a | `'a'` | `'left'` |
| IH-032 | 大文字 A | `'A'` | `'left'` |
| IH-033 | ArrowUp | `'ArrowUp'` | `'straight'` |
| IH-034 | 小文字 w | `'w'` | `'straight'` |
| IH-035 | 大文字 W | `'W'` | `'straight'` |
| IH-036 | ArrowRight | `'ArrowRight'` | `'right'` |
| IH-037 | 小文字 d | `'d'` | `'right'` |
| IH-038 | 大文字 D | `'D'` | `'right'` |
| IH-039 | 対応外キー (Space) | `' '` | `null` |
| IH-040 | 対応外キー (Enter) | `'Enter'` | `null` |
| IH-041 | 対応外キー (ArrowDown) | `'ArrowDown'` | `null` |
| IH-042 | 空文字 | `''` | `null` |

### 4.5 UT: enable() / disable()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| IH-050 | 無効時の入力は無視 | `disable()` → タップイベント発火 | `getLastInput() === null` |
| IH-051 | 有効に戻すと入力を受付 | `disable()` → `enable()` → タップ | `getLastInput() !== null` |
| IH-052 | 初期状態は有効 | 初期化直後にタップ | `getLastInput() !== null` |

### 4.6 UT: clearLastInput()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| IH-060 | 入力クリア | タップ後に `clearLastInput()` | `getLastInput() === null` |
| IH-061 | 既にnullの状態でクリア | `clearLastInput()` を2回呼ぶ | エラーがスローされない |

### 4.7 UT: 最後の入力の上書き

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| IH-070 | 複数回入力で最後が適用 | 左タップ → 右タップ → 中央タップ | `getLastInput().direction === 'straight'` |
| IH-071 | 同じ方向を複数回 | 左タップ → 左タップ | `getLastInput().direction === 'left'` |

---

## 5. IntersectionJudge テスト

**テストファイル**: `src/judge/IntersectionJudge.test.ts`

### 5.1 UT: update() — 接近検知

| ID | テストケース | distance | speed | 期待結果 |
|----|------------|----------|-------|---------|
| IJ-001 | 交差点まで3秒超 | 100.0 | 20.0 | `isApproaching === false` |
| IJ-002 | 交差点までちょうど3秒 | 60.0 | 20.0 | `isApproaching === true` |
| IJ-003 | 交差点まで2秒 | 40.0 | 20.0 | `isApproaching === true` |
| IJ-004 | 交差点まで0.1秒超 | 2.1 | 20.0 | `isApproaching === true`, `isInputLocked === false` |
| IJ-005 | 交差点までちょうど0.1秒 | 2.0 | 20.0 | `isInputLocked === true` |
| IJ-006 | 交差点まで0.05秒 | 1.0 | 20.0 | `isInputLocked === true` |

### 5.2 UT: update() — 異常値テスト

| ID | テストケース | distance | speed | 期待結果 |
|----|------------|----------|-------|---------|
| IJ-010 | speed が 0 | 50.0 | 0.0 | 状態が更新されない |
| IJ-011 | speed が負値 | 50.0 | -5.0 | 状態が更新されない |
| IJ-012 | distance が 0 | 0.0 | 20.0 | `isApproaching === true`, `isInputLocked === true` |
| IJ-013 | distance が負値 | -10.0 | 20.0 | `isApproaching === true`, `isInputLocked === true` |

### 5.3 UT: judge() — 十字路 (cross) での正解判定

| ID | テストケース | playerInput | npcDirection | 期待結果 |
|----|------------|-------------|-------------|---------|
| IJ-020 | 左折で正解 | `{ direction: 'left' }` | `'left'` | `isCorrect === true` |
| IJ-021 | 直進で正解 | `{ direction: 'straight' }` | `'straight'` | `isCorrect === true` |
| IJ-022 | 右折で正解 | `{ direction: 'right' }` | `'right'` | `isCorrect === true` |
| IJ-023 | 左折で不正解 (正解は右) | `{ direction: 'left' }` | `'right'` | `isCorrect === false` |
| IJ-024 | 直進で不正解 (正解は左) | `{ direction: 'straight' }` | `'left'` | `isCorrect === false` |
| IJ-025 | 右折で不正解 (正解は直進) | `{ direction: 'right' }` | `'straight'` | `isCorrect === false` |

### 5.4 UT: judge() — T字路 (t-junction) での判定

| ID | テストケース | availableDirections | playerInput | npcDirection | 期待結果 |
|----|------------|-------------------|-------------|-------------|---------|
| IJ-030 | T字路で左折正解 | `['left', 'right']` | `{ direction: 'left' }` | `'left'` | `isCorrect === true` |
| IJ-031 | T字路で右折正解 | `['left', 'right']` | `{ direction: 'right' }` | `'right'` | `isCorrect === true` |
| IJ-032 | T字路で直進選択 (不正解) | `['left', 'right']` | `{ direction: 'straight' }` | `'left'` | `isCorrect === false` |
| IJ-033 | T字路で左折不正解 | `['left', 'right']` | `{ direction: 'left' }` | `'right'` | `isCorrect === false` |

### 5.5 UT: judge() — 入力なし (null) の場合

| ID | テストケース | availableDirections | playerInput | npcDirection | 期待結果 |
|----|------------|-------------------|-------------|-------------|---------|
| IJ-040 | 入力なし、十字路、NPC直進 | `['left','straight','right']` | `null` | `'straight'` | `isCorrect === true` (デフォルト直進) |
| IJ-041 | 入力なし、十字路、NPC左折 | `['left','straight','right']` | `null` | `'left'` | `isCorrect === false` |
| IJ-042 | 入力なし、T字路 (直進不可)、NPC左折 | `['left', 'right']` | `null` | `'left'` | `isCorrect === false` (デフォルト直進は不可) |

### 5.6 UT: judge() — 結果オブジェクトの検証

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| IJ-050 | 正解時の結果オブジェクト | 正解の入力 | `{ isCorrect: true, playerDirection, correctDirection, intersectionId }` の全フィールドが正しい |
| IJ-051 | 不正解時の結果オブジェクト | 不正解の入力 | `{ isCorrect: false, playerDirection, correctDirection, intersectionId }` の全フィールドが正しい |
| IJ-052 | intersectionId が正しく設定される | intersectionId = `'INT_05'` | result.intersectionId === `'INT_05'` |

### 5.7 UT: resetState()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| IJ-060 | リセット後の状態 | 接近中にリセット | `isApproaching === false`, `isInputLocked === false` |

---

## 6. IntersectionNode テスト

**テストファイル**: `src/map/IntersectionNode.test.ts`

### 6.1 UT: getAvailableDirections()

| ID | テストケース | type | fromRoadId | 期待結果 |
|----|------------|------|-----------|---------|
| IN-001 | 十字路で3方向 | `'cross'` | 有効な道路ID | 3方向 `['left','straight','right']` |
| IN-002 | T字路で2方向 | `'t-junction'` | 有効な道路ID | 2方向 (例: `['left','right']`) |
| IN-003 | 存在しない道路ID | 任意 | `'ROAD_INVALID'` | 空配列 `[]` |

### 6.2 UT: getRoute()

| ID | テストケース | fromRoadId | direction | 期待結果 |
|----|------------|-----------|-----------|---------|
| IN-010 | 有効なルート | 有効ID | 有効な方向 | `RouteOption` オブジェクト |
| IN-011 | T字路で直進 (不可方向) | T字路の道路ID | `'straight'` | `undefined` |
| IN-012 | 存在しない道路からの進入 | `'ROAD_INVALID'` | `'left'` | `undefined` |

---

## 7. Road テスト

**テストファイル**: `src/map/Road.test.ts`

### 7.1 UT: getPositionAtProgress()

| ID | テストケース | progress | 期待結果 |
|----|------------|----------|---------|
| RD-001 | 始点 (0.0) | 0.0 | 始点の交差点位置と一致 |
| RD-002 | 終点 (1.0) | 1.0 | 終点の交差点位置と一致 |
| RD-003 | 中間点 (0.5) | 0.5 | 始点と終点の中間座標 |

### 7.2 UT: getPositionAtProgress() — 境界値テスト

| ID | テストケース | progress | 期待結果 | 分類 |
|----|------------|----------|---------|------|
| RD-010 | ちょうど 0.0 | 0.0 | 始点位置 | 下限値 |
| RD-011 | ちょうど 1.0 | 1.0 | 終点位置 | 上限値 |
| RD-012 | 0.0 未満 | -0.1 | 0.0 にクランプ → 始点位置 | 下限異常値 |
| RD-013 | 1.0 超過 | 1.5 | 1.0 にクランプ → 終点位置 | 上限異常値 |
| RD-014 | 微小値 | 0.001 | 始点付近の座標 | 極小値 |
| RD-015 | 1.0 直前 | 0.999 | 終点付近の座標 | 上限直前 |

### 7.3 UT: getOppositeIntersectionId()

| ID | テストケース | fromIntersectionId | 期待結果 |
|----|------------|-------------------|---------|
| RD-020 | 始点から終点を取得 | startIntersectionId | endIntersectionId |
| RD-021 | 終点から始点を取得 | endIntersectionId | startIntersectionId |
| RD-022 | 無関係なIDを指定 | `'INT_INVALID'` | エラーがスローされる |

---

## 8. PlayerCar テスト

**テストファイル**: `src/vehicles/PlayerCar.test.ts`

### 8.1 UT: update() — 通常走行

| ID | テストケース | deltaTime | 前提 | 期待結果 |
|----|------------|-----------|------|---------|
| PC-001 | 進行率が増加する | 0.016 | progress = 0.0 | progress > 0.0 |
| PC-002 | 道路の終端に近づく | 連続 update | progress = 0.5 | progress が 1.0 に近づく |

### 8.2 UT: startSpin() / スピン動作

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| PC-010 | スピン開始 | `startSpin()` | `getIsSpinning() === true` |
| PC-011 | スピン中は位置更新しない | `startSpin()` → `update(0.016)` | position が変化しない |
| PC-012 | スピン中のZ軸回転 (0.5秒時点) | `startSpin()` → `update(0.5)` | Z軸回転 = 180度 (π ラジアン) |
| PC-013 | スピン完了 (1.0秒後) | `startSpin()` → `update(1.0)` | `getIsSpinning() === false` |
| PC-014 | スピン完了後に走行再開 | スピン完了後に `update(0.016)` | position が変化する |

### 8.3 UT: スピン — 境界値テスト

| ID | テストケース | spinElapsed | 期待結果 |
|----|------------|------------|---------|
| PC-020 | 0秒 (開始直後) | 0.0 | Z軸回転 = 0度, isSpinning = true |
| PC-021 | 0.999秒 | 0.999 | isSpinning = true |
| PC-022 | 1.0秒ちょうど | 1.0 | isSpinning = false (スピン終了) |
| PC-023 | 1.001秒 | 1.001 | isSpinning = false |

### 8.4 UT: enterRoad()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| PC-030 | 新しい道路に進入 | `enterRoad('ROAD_02', 'INT_05')` | `getCurrentRoadId() === 'ROAD_02'`, `currentProgress === 0.0` |

---

## 9. NpcBuggy テスト

**テストファイル**: `src/vehicles/NpcBuggy.test.ts`

### 9.1 UT: decideDirection() — 正常系

| ID | テストケース | availableDirections | 期待結果 |
|----|------------|-------------------|---------|
| NB-001 | 3方向から選択 | `['left','straight','right']` | 返り値が3方向のいずれか |
| NB-002 | 2方向から選択 | `['left','right']` | 返り値が2方向のいずれか |
| NB-003 | 1方向のみ | `['straight']` | `'straight'` |

### 9.2 UT: decideDirection() — 異常値テスト

| ID | テストケース | availableDirections | 期待結果 |
|----|------------|-------------------|---------|
| NB-010 | 空配列 | `[]` | エラーがスローされる |

### 9.3 UT: decideDirection() — ランダム性の統計検証

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| NB-020 | 均等分布の確認 | `['left','straight','right']` で 1000 回実行 | 各方向が 25%〜42% の範囲 (χ²検定 p > 0.01) |

### 9.4 UT: getChosenDirection()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| NB-030 | 初期状態 | 初期化直後 | `null` |
| NB-031 | 方向決定後 | `decideDirection()` 実行後 | Direction 値 |

---

## 10. MapManager テスト

**テストファイル**: `src/map/MapManager.test.ts`

### 10.1 UT: getIntersection()

| ID | テストケース | id | 期待結果 |
|----|------------|------|---------|
| MM-001 | 存在するID | `'INT_01'` | IntersectionNode オブジェクト |
| MM-002 | 存在しないID | `'INT_99'` | `undefined` |
| MM-003 | 空文字 | `''` | `undefined` |

### 10.2 UT: getRoad()

| ID | テストケース | id | 期待結果 |
|----|------------|------|---------|
| MM-010 | 存在するID | `'ROAD_01'` | Road オブジェクト |
| MM-011 | 存在しないID | `'ROAD_99'` | `undefined` |

### 10.3 UT: getAvailableRoutes()

| ID | テストケース | intersectionId | fromRoadId | 期待結果 |
|----|------------|---------------|-----------|---------|
| MM-020 | 十字路の有効なルート | `'INT_02'` | `'ROAD_10'` | 3つの RouteOption |
| MM-021 | T字路の有効なルート | `'INT_01'` | `'ROAD_10'` | 2つの RouteOption |
| MM-022 | 存在しない交差点ID | `'INT_99'` | `'ROAD_01'` | 空配列 |
| MM-023 | 存在しない道路ID | `'INT_01'` | `'ROAD_99'` | 空配列 |

### 10.4 IT: マップデータ整合性検証

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| MM-030 | 全道路の始点・終点が有効な交差点 | 全 ROAD_DEFINITIONS | すべての start, end が INTERSECTION_DEFINITIONS に存在する |
| MM-031 | 全交差点に最低2本の道路が接続 | 全 INTERSECTION_DEFINITIONS | 各交差点に2本以上の道路が接続 (行き止まりなし) |
| MM-032 | 交差点IDの一意性 | 全 INTERSECTION_DEFINITIONS | ID が重複していない |
| MM-033 | 道路IDの一意性 | 全 ROAD_DEFINITIONS | ID が重複していない |
| MM-034 | ルックアウトタワーが存在する | マップデータ | landmark === 'lookoutTower' の交差点が1つ以上 |
| MM-035 | グラフの連結性 | 全交差点・道路 | 任意の交差点から他の全交差点に到達可能 |
| MM-036 | 交差点数が約10 | 全 INTERSECTION_DEFINITIONS | length === 10 |
| MM-037 | 行き止まりなし検証 | 全交差点 | 全交差点で全進入方向に対し availableRoutes.length >= 1 |

---

## 11. EffectManager テスト

**テストファイル**: `src/ui/EffectManager.test.ts`

### 11.1 UT: playCorrectEffect()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| EM-001 | エフェクト生成数 | `playCorrectEffect()` | 12個の星エフェクト + 1個のテキストエフェクト = 合計13個 |
| EM-002 | テキストの内容 | `playCorrectEffect()` | テキストエフェクトの内容が `'Great!'` |

### 11.2 UT: update() — エフェクトのライフサイクル

| ID | テストケース | deltaTime | 前提 | 期待結果 |
|----|------------|-----------|------|---------|
| EM-010 | エフェクト表示中 | 0.5 | playCorrectEffect() 直後 | activeEffects.length > 0 |
| EM-011 | エフェクト消滅 (1秒後) | 1.0 | playCorrectEffect() 直後 | activeEffects.length === 0 |
| EM-012 | 連続再生 | — | 2回連続 playCorrectEffect() | 前のエフェクトと新しいエフェクトが共存 |

### 11.3 UT: clearAll()

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| EM-020 | 全クリア | エフェクト再生中に `clearAll()` | `activeEffects.length === 0` |
| EM-021 | 空の状態でクリア | エフェクトなしで `clearAll()` | エラーがスローされない |

---

## 12. Logger テスト

**テストファイル**: `src/logger/Logger.test.ts`

### 12.1 UT: ログフォーマット検証

| ID | テストケース | 入力 | 期待結果 |
|----|------------|------|---------|
| LG-001 | INFO ログのフォーマット | `info('GameEngine', 'ゲーム開始', { score: 0 })` | `[ISO8601+09:00] [INFO] [GameEngine] ゲーム開始 {"score":0}` の形式 |
| LG-002 | context なしのログ | `info('API', 'リクエスト受信')` | context 部分がない、またはなし |
| LG-003 | タイムスタンプが JST | `info(...)` | タイムスタンプに `+09:00` が含まれる |

### 12.2 UT: ログレベルフィルタ

| ID | テストケース | environment | 呼び出し | 期待結果 |
|----|------------|------------|---------|---------|
| LG-010 | development で DEBUG | `'development'` | `debug(...)` | 出力される |
| LG-011 | production で DEBUG | `'production'` | `debug(...)` | 出力されない |
| LG-012 | production で INFO | `'production'` | `info(...)` | 出力される |
| LG-013 | staging で DEBUG | `'staging'` | `debug(...)` | 出力されない |
| LG-014 | staging で INFO | `'staging'` | `info(...)` | 出力される |
| LG-015 | 全環境で ERROR | 全環境 | `error(...)` | すべて出力される |
| LG-016 | 全環境で FATAL | 全環境 | `fatal(...)` | すべて出力される |

### 12.3 UT: レベル優先度

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| LG-020 | レベル優先度の順序 | — | DEBUG < INFO < WARN < ERROR < FATAL |

---

## 13. GameManager 統合テスト

**テストファイル**: `src/core/GameManager.test.ts`

### 13.1 IT: 状態遷移

| ID | テストケース | 操作 | 期待結果 |
|----|------------|------|---------|
| GM-001 | 初期状態 | `initialize()` | `gameState === 'title'` |
| GM-002 | タイトル → プレイ | `startGame()` | `gameState === 'playing'` |
| GM-003 | プレイ → ゲームオーバー | `endGame()` | `gameState === 'gameover'` |
| GM-004 | ゲームオーバー → タイトル | `returnToTitle()` | `gameState === 'title'` |

### 13.2 IT: 不正な状態遷移

| ID | テストケース | 現在状態 | 操作 | 期待結果 |
|----|------------|---------|------|---------|
| GM-010 | タイトルから endGame | `'title'` | `endGame()` | 状態変化なし、WARN ログ |
| GM-011 | プレイ中に startGame | `'playing'` | `startGame()` | 状態変化なし、WARN ログ |
| GM-012 | ゲームオーバーから endGame | `'gameover'` | `endGame()` | 状態変化なし、WARN ログ |

### 13.3 IT: ゲーム開始時の初期化

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| GM-020 | スコアリセット | `startGame()` | `scoreManager.getCurrentScore() === 0` |
| GM-021 | タイマーリセット | `startGame()` | `timerManager.getRemainingTime() === 60.0` |
| GM-022 | 入力クリア | `startGame()` | `inputHandler.getLastInput() === null` |

### 13.4 IT: タイムアップ連携

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| GM-030 | 60秒経過でゲームオーバー | 60秒分の update 呼び出し | `gameState === 'gameover'` |
| GM-031 | ゲームオーバー時にハイスコア更新 | スコア > 0 で終了 | `updateHighScore()` が呼ばれる |

### 13.5 IT: 交差点判定連携 — 正解フロー

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| GM-040 | 正解でスコア加算 | NPC方向と同じ方向を入力し交差点到達 | スコアが +1 される |
| GM-041 | 正解でエフェクト再生 | 同上 | `playCorrectEffect()` が呼ばれる |
| GM-042 | 正解で入力クリア | 同上 | `getLastInput() === null` |

### 13.6 IT: 交差点判定連携 — 不正解フロー

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| GM-050 | 不正解でスピン開始 | NPC方向と異なる方向を入力し交差点到達 | `playerCar.getIsSpinning() === true` |
| GM-051 | 不正解でスコア変化なし | 同上 | スコアが変化しない |
| GM-052 | スピン中は入力無効 | スピン中に入力 | `inputHandler.isEnabled === false` |
| GM-053 | スピン後に正解ルートに復帰 | スピン完了後 | NPCの進んだ道路を走行中 |

---

## 14. React コンポーネントテスト

**テストファイル**: `src/scenes/*.test.tsx`, `src/ui/*.test.tsx`

### 14.1 CT: TitleScene

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| TS-001 | ロゴが表示される | レンダリング | ロゴ要素が DOM に存在する |
| TS-002 | スタートボタンが表示される | レンダリング | スタートボタンが DOM に存在する |
| TS-003 | スタートボタン押下で遷移 | スタートボタンをクリック | `onStart` コールバックが呼ばれる |

### 14.2 CT: GameOverScene

| ID | テストケース | props | 期待結果 |
|----|------------|-------|---------|
| GO-001 | スコア表示 | score = 15 | `'15'` がテキストに含まれる |
| GO-002 | メッセージ表示 (0〜9点) | score = 5 | `'よく頑張ったね！'` が表示される |
| GO-003 | メッセージ表示 (10〜19点) | score = 10 | `'すごいすごい！！'` が表示される |
| GO-004 | メッセージ表示 (20点以上) | score = 25 | `'キミもパウパトロールにならない？！！'` が表示される |
| GO-005 | リトライボタン押下 | クリック | `onRetry` コールバックが呼ばれる |

### 14.3 CT: HudRenderer

| ID | テストケース | props | 期待結果 |
|----|------------|-------|---------|
| HU-001 | タイマー表示 | displayTime = '00:45' | `'00:45'` が表示される |
| HU-002 | スコア表示 | score = 8 | `'8'` が表示される |
| HU-003 | 方向指示アイコン非表示 | isApproaching = false | アイコンが表示されない |
| HU-004 | 方向指示アイコン表示 (十字路) | isApproaching = true, availableDirections = ['left','straight','right'] | 3方向すべてのアイコンが表示される |
| HU-005 | 方向指示アイコン表示 (T字路) | isApproaching = true, availableDirections = ['left','right'] | 左右のみアイコンが表示される |
| HU-006 | 選択方向のハイライト | selectedDirection = 'left' | 左アイコンにハイライトクラスが付与される |
| HU-007 | 選択なし | selectedDirection = null | ハイライトクラスなし |

---

## 15. CameraController テスト

**テストファイル**: `src/camera/CameraController.test.ts`

### 15.1 UT: update() — カメラ追従

| ID | テストケース | 入力 | 期待結果 |
|----|------------|------|---------|
| CC-001 | プレーヤー前方にカメラ追従 | position変化 → update() | カメラ位置がプレーヤー後方に更新される |
| CC-002 | 回転時のカメラ追従 | rotation変化 → update() | カメラがプレーヤーの背後を維持する |

### 15.2 UT: onResize()

| ID | テストケース | width | height | 期待結果 |
|----|------------|-------|--------|---------|
| CC-010 | 通常リサイズ | 414 | 896 | アスペクト比が更新される |
| CC-011 | 横長画面 | 896 | 414 | アスペクト比が更新される |
| CC-012 | width = 0 | 0 | 896 | エラーがスローされない (安全に処理) |
| CC-013 | height = 0 | 414 | 0 | エラーがスローされない (安全に処理) |

---

## 16. ゲーム設定定数テスト

**テストファイル**: `src/config/gameConfig.test.ts`

### 16.1 UT: GAME_CONFIG の値の整合性

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| GC-001 | ゲーム時間が正の数 | — | `GAME_DURATION_SEC > 0` |
| GC-002 | ゲーム時間が60秒 | — | `GAME_DURATION_SEC === 60` |
| GC-003 | 車両速度が正の数 | — | `VEHICLE_SPEED > 0` |
| GC-004 | 方向指示表示時間 > 入力締切時間 | — | `DIRECTION_SHOW_SEC > INPUT_DEADLINE_SEC` |
| GC-005 | 入力締切時間が正の数 | — | `INPUT_DEADLINE_SEC > 0` |
| GC-006 | スピン時間が正の数 | — | `SPIN_DURATION_SEC > 0` |
| GC-007 | 正解スコアが正の整数 | — | `CORRECT_SCORE >= 1` |
| GC-008 | 星エフェクト数が正の整数 | — | `STAR_EFFECT_COUNT >= 1` |

### 16.2 UT: SCORE_MESSAGES の整合性

| ID | テストケース | 入力/前提条件 | 期待結果 |
|----|------------|-------------|---------|
| GC-010 | メッセージが全スコア範囲をカバー | — | minScore = 0 から始まり、最後の maxScore が null |
| GC-011 | メッセージの範囲が重複しない | — | 各区間の minScore === 前区間の maxScore |
| GC-012 | メッセージが空文字でない | — | 全 message.length > 0 |

---

## 17. 全体結合テスト (E2E相当)

**テストファイル**: `src/e2e/GameFlow.test.ts`

※ Three.js のレンダリングを含まないロジック層の結合テスト。DOM は jsdom で模擬。

### 17.1 シナリオテスト

| ID | テストシナリオ | 手順 | 期待結果 |
|----|-------------|------|---------|
| E2E-001 | ゲーム1回プレイ完了 | タイトル → スタート → 60秒経過 → ゲームオーバー → リトライ → タイトル | 状態遷移が正しく、スコアが表示される |
| E2E-002 | 全問正解シナリオ | NPCの方向と同じ方向を毎回入力 | スコアが交差点通過回数と一致する |
| E2E-003 | 全問不正解シナリオ | NPCの方向と毎回異なる方向を入力 | スコアが 0 のまま |
| E2E-004 | 入力なしシナリオ | 一切入力しない | NPC直進時のみ正解 (直進がデフォルト) |
| E2E-005 | スピン中の入力無視 | 不正解でスピン中に入力 → 次の交差点 | スピン中の入力は無視され、次の交差点で正常に判定 |
| E2E-006 | ハイスコア更新 | 1回目: 5点 → 2回目: 8点 | ハイスコアが 8 に更新される |
| E2E-007 | ハイスコア未更新 | 1回目: 10点 → 2回目: 3点 | ハイスコアが 10 のまま |

### 17.2 タイミングシナリオ

| ID | テストシナリオ | 手順 | 期待結果 |
|----|-------------|------|---------|
| E2E-010 | 3秒前に方向指示が出る | 交差点の3秒前まで進行 | HUD に方向指示アイコンが表示される |
| E2E-011 | 0.1秒前に入力が締め切られる | 0.1秒前に入力変更を試みる | 入力が受け付けられない (最後のロック前入力が適用) |
| E2E-012 | 入力上書き (最後の入力が適用) | 2秒前に右 → 1秒前に左 | 左折が適用される |
| E2E-013 | ゲームオーバー直前のスピン | 残り0.5秒で不正解 → 0.5秒後にタイムアップ | スピン途中でもゲームオーバーに遷移する |

---

## 付録A: テストID体系

| 接頭辞 | 対象モジュール |
|--------|-------------|
| SM | ScoreManager |
| TM | TimerManager |
| IH | InputHandler |
| IJ | IntersectionJudge |
| IN | IntersectionNode |
| RD | Road |
| PC | PlayerCar |
| NB | NpcBuggy |
| MM | MapManager |
| EM | EffectManager |
| LG | Logger |
| GM | GameManager (統合) |
| TS | TitleScene |
| GO | GameOverScene |
| HU | HudRenderer |
| CC | CameraController |
| GC | GameConfig |
| E2E | 全体結合テスト |

## 付録B: テストケース数 サマリ

| カテゴリ | テストケース数 |
|---------|-------------|
| ScoreManager (UT) | 18 |
| TimerManager (UT) | 14 |
| InputHandler (UT) | 24 |
| IntersectionJudge (UT) | 18 |
| IntersectionNode (UT) | 6 |
| Road (UT) | 9 |
| PlayerCar (UT) | 9 |
| NpcBuggy (UT) | 6 |
| MapManager (UT/IT) | 12 |
| EffectManager (UT) | 5 |
| Logger (UT) | 10 |
| GameManager (IT) | 16 |
| React コンポーネント (CT) | 12 |
| CameraController (UT) | 6 |
| GameConfig (UT) | 11 |
| 全体結合 (E2E) | 11 |
| **合計** | **187** |
