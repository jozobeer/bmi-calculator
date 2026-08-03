# BMI計算機

身長（cm）と体重（kg）を入力すると、BMI 値（体重kg ÷ (身長m)²）を小数点第1位までリアルタイム計算し、日本肥満学会基準の判定ラベル（低体重・普通体重・肥満（1度）〜肥満（4度））を表示する静的単一ページアプリ。未入力または 0 以下のときはプレースホルダを表示する。ボタン操作は不要。

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
- `tests/app.spec.ts` — Playwright による受け入れ条件のテスト
- `PLAN.md` — 初回実装時の計画（歴史的文書。現状の正は README とテスト）
