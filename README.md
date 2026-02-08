# PAW CHASE - タップレースゲーム

3D タップ操作のレースゲーム。パトカーを操作して逃走車を追いかけ、交差点で正しい方向を選んでスコアを稼ごう。

- React 19 + Three.js + TypeScript
- Vite でビルド / Vitest でテスト

## 必要環境

- Node.js 22 以上
- npm 10 以上

## セットアップ

```bash
git clone https://github.com/sakanayuki/cc_tapgame.git
cd cc_tapgame
npm install
```

## 開発

```bash
# 開発サーバー起動 (http://localhost:5173)
npm run dev

# テスト実行
npm test

# テスト (ウォッチモード)
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# 本番ビルド (dist/ に出力)
npm run build

# ビルド結果をプレビュー
npm run preview
```

## GitHub Pages デプロイ

### 自動デプロイ (GitHub Actions)

`main` ブランチまたは `claude/**` ブランチへの push で自動的にデプロイされます。

#### 初回セットアップ手順

1. GitHub リポジトリの **Settings > Pages** を開く
2. **Source** を **GitHub Actions** に変更する
3. 対象ブランチに push する

ワークフロー (`.github/workflows/deploy.yml`) がテスト → ビルド → デプロイを自動実行します。

デプロイ後の URL: `https://sakanayuki.github.io/cc_tapgame/`

### 手動デプロイ

GitHub Actions の **Actions** タブから `Deploy to GitHub Pages` ワークフローを選び、**Run workflow** で手動実行も可能です。

### ローカルでビルドして確認

```bash
npm run build
npm run preview
```

`dist/` ディレクトリに静的ファイルが生成されます。`vite.config.ts` の `base: '/cc_tapgame/'` により、GitHub Pages のサブパスに対応済みです。

## プロジェクト構成

```
src/
├── config/       # ゲーム設定定数
├── core/         # GameManager, ScoreManager, TimerManager
├── input/        # タッチ・キーボード入力
├── judge/        # 交差点判定ロジック
├── logger/       # 統一ログ出力
├── map/          # マップデータ・道路・交差点グラフ
├── vehicles/     # プレイヤー車両・NPC車両
├── camera/       # 3人称カメラ制御
├── ui/           # HUD・エフェクト
├── scenes/       # タイトル・ゲームオーバー画面
└── types/        # 型定義
docs/
├── requirements.md       # 要件定義書
├── detailed-design.md    # 詳細設計書
└── test-specification.md # テスト仕様書
```

## ライセンス

Private
