# BMI計算機

このリポジトリは kojo が生成した単一ページWebアプリです。

## アイデア

# BMI計算機

身長（cm）と体重（kg）を入力すると自動的にBMI値を計算し、肥満度の判定（低体重・普通体重・肥満など）も合わせて表示する静的単一ページアプリ。

## 受け入れ条件の種

- 身長と体重を入力するとBMI値が小数点第1位まで自動計算されて表示される
- 算出されたBMI値に応じて「低体重」「普通体重」「肥満」などの判定ラベルが表示される
- 身長または体重の入力値を変更するたびにBMI値と判定が再計算される


## 技術スタック（不変）

- バニラJS・単一 `public/index.html`（CSS/JSインライン）・ビルドなし
- 配信: Cloudflare Workers assets（`wrangler.jsonc`）
- テスト: Playwright（`tests/app.spec.ts`、`npm test`）
- 保守時もこのスタックを維持すること。フレームワーク・ビルドツール・宣言外ライブラリの導入は禁止

## 制約

- 静的アプリ（`public/` 配下のみ）。サーバコード・外部API・ビルドツールは使わない
- `public/index.html` を単一ファイルで完結させる（CSS/JSインライン可）
- PLAN.md の受け入れ条件それぞれに対応するテストを `tests/app.spec.ts` に追記し、`npm test` が通ること（雛形のスモークテストは削除しない）
- favicon を `<link rel="icon" href="data:image/svg+xml,...">` のインライン data URI で含める（外部ファイル・外部URL不可。アプリのテーマに合った絵柄にする）
- hub（apps.jozo.beer）へのフッター導線を入れる。マークアップは次のとおり固定する:

  ```html
  <footer style="margin-top:3rem;text-align:center;font-size:.8rem;opacity:.6">
    <a href="https://apps.jozo.beer" style="color:inherit">apps.jozo.beer</a>
  </footer>
  ```

  スタイル（リンク色を含む）はアプリのテーマに合わせて調整してよいが、リンク先 `https://apps.jozo.beer` とリンクテキスト `apps.jozo.beer` は変えない。リンク色を変える場合は背景とのコントラストを確保すること

  配置は縦方向の通常フローの最下部に統合する。body がセンタリングレイアウト（display:flex / display:grid で中央寄せ）の場合、`</body>` 直前に置くと footer がその flex/grid アイテムになりレイアウトが崩れる（row 方向 flex では横並びになる）ため、body を flex-direction: column にするか、センタリング済みメインコンテナ内の末尾に置くこと。それ以外の場合は `</body>` 直前でよい
- README.md はテンプレートが生成済み。削除しないこと
- apple-touch-icon / manifest / og-image / robots / sitemap は factory が公開時に自動生成するため、builder は書かない
- 完成条件: PLAN.md の受け入れ条件をすべて満たし、`npm run verify` と `npm test` が通ること
