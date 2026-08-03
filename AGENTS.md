# BMI計算機

身長（cm）と体重（kg）から BMI をリアルタイム計算し、日本肥満学会基準の肥満度判定を表示する静的単一ページアプリ。

## アプリ概要と構成

- エントリ: `public/index.html`（CSS/JS インライン、外部リソースなし）
- 入力: `#height`（cm）・`#weight`（kg）。`input` イベントのたびに再計算
- 計算: `calcBmi` — `weightKg / (heightCm / 100) ** 2`、表示は小数点第1位（`toFixed(1)`）
- 判定: `classifyBmi` — 18.5 未満「低体重」、18.5 以上 25 未満「普通体重」、25 以上 30 未満「肥満（1度）」、30 以上 35 未満「肥満（2度）」、35 以上 40 未満「肥満（3度）」、40 以上「肥満（4度）」（下限含む・上限含まず）
- 結果: `#bmi-value` / `#bmi-label`。未入力または 0 以下のときは `#result` にプレースホルダ「身長と体重を入力してください」
- テスト: `tests/app.spec.ts`（Playwright、`file://` で `public/index.html` を開く）
- 配信: Cloudflare Workers assets（`wrangler.jsonc`）

現状の仕様の正は README.md と `tests/app.spec.ts` である。`PLAN.md` は初回実装時の計画（歴史的文書）であり、受け入れ条件の最新ソースとしては扱わない。

## 技術スタック（不変）

- バニラJS・単一 `public/index.html`（CSS/JSインライン）・ビルドなし
- 配信: Cloudflare Workers assets（`wrangler.jsonc`）
- テスト: Playwright（`tests/app.spec.ts`、`npm test`）
- 保守時もこのスタックを維持すること。フレームワーク・ビルドツール・宣言外ライブラリの導入は禁止

## 品質不変条件

次を壊してはならない。変更後は必ず `npm run verify` が通る状態を維持すること。

- **favicon**: `<link rel="icon" href="data:image/svg+xml,...">` のインライン data URI（外部ファイル・外部 URL 不可）
- **フッター**: hub（apps.jozo.beer）への導線。リンク先 `https://apps.jozo.beer` とリンクテキスト `apps.jozo.beer` は変えない

```html
<footer style="margin-top:3rem;text-align:center;font-size:.8rem;opacity:.6">
  <a href="https://apps.jozo.beer" style="color:inherit">apps.jozo.beer</a>
</footer>
```

スタイル（リンク色を含む）はテーマに合わせて調整してよい。リンク色を変える場合は背景とのコントラストを確保すること。body が flex/grid のセンタリングレイアウトのときは、`flex-direction: column` にするかメインコンテナ末尾に置き、フッターが横並びの flex アイテムにならないようにする。

その他:

- 静的アプリ（`public/` 配下のみ）。サーバコード・外部 API・ビルドツールは使わない
- `public/index.html` を単一ファイルで完結させる（CSS/JS インライン可）
- 雛形のスモークテスト（ページロード・ページエラーなし）は削除しない
- README.md は削除しない

## 保守の進め方

1. 変更したい振る舞いを受け入れ条件として `tests/app.spec.ts` に先に書く（または既存テストを更新する）
2. `public/index.html` を実装・修正する
3. `npm test` と `npm run verify` を通す
4. `npm run deploy` で Cloudflare Workers へデプロイする
