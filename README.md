# BMI計算機

身長（cm）と体重（kg）を入力すると自動的にBMI値を計算し、肥満度の判定（低体重・普通体重・肥満など）も合わせて表示する静的単一ページアプリ。

## 公開URL

https://bmi-calculator.jozo.beer

## 開発

[kojo](https://github.com/jozobeer/kojo)（1日1アプリ自動生成基盤）により生成されたリポジトリです。

初回セットアップ: `npm install`（Playwright ブラウザ未取得の環境では `npx playwright install chromium`）

- `npm test` — Playwright によるブラウザテスト
- `npm run verify` — 不変条件チェック（favicon / apps.jozo.beer フッター）
- `npm run deploy` — Cloudflare Workers へデプロイ

## 構成

- `public/index.html` — アプリ本体（CSS/JSインラインの単一ファイル）
- `PLAN.md` — 受け入れ条件付きの実装計画
