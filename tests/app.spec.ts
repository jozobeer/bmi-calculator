import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";

// 静的アプリなのでサーバ不要。kojo の visualGate と同じ file:// 方式で開く
const APP_URL = pathToFileURL("public/index.html").href;

test("ページがロードできページエラーが出ない", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto(APP_URL);
  await expect(page.locator("body")).toBeVisible();
  expect(errors).toEqual([]);
});

// このスモークは削除しないこと。機能テストは PLAN.md の受け入れ条件ごとに追記する

test("身長170・体重60でBMI値20.8が表示される", async ({ page }) => {
  await page.goto(APP_URL);
  await page.fill("#height", "170");
  await page.fill("#weight", "60");
  await expect(page.locator("#bmi-value")).toHaveText("20.8");
});

test("BMI値に応じた判定ラベルが日本肥満学会基準で表示される", async ({ page }) => {
  await page.goto(APP_URL);

  // 170cm/50kg → 17.3 低体重
  await page.fill("#height", "170");
  await page.fill("#weight", "50");
  await expect(page.locator("#bmi-value")).toHaveText("17.3");
  await expect(page.locator("#bmi-label")).toHaveText("低体重");

  // 170cm/75kg → 26.0 肥満（1度）
  await page.fill("#weight", "75");
  await expect(page.locator("#bmi-value")).toHaveText("26.0");
  await expect(page.locator("#bmi-label")).toHaveText("肥満（1度）");

  // 境界値 18.5 → 普通体重
  await page.fill("#height", "100");
  await page.fill("#weight", "18.5");
  await expect(page.locator("#bmi-value")).toHaveText("18.5");
  await expect(page.locator("#bmi-label")).toHaveText("普通体重");

  // 境界値 25.0 → 肥満（1度）
  await page.fill("#height", "100");
  await page.fill("#weight", "25");
  await expect(page.locator("#bmi-value")).toHaveText("25.0");
  await expect(page.locator("#bmi-label")).toHaveText("肥満（1度）");

  // 境界値 30.0 → 肥満（2度）
  await page.fill("#weight", "30");
  await expect(page.locator("#bmi-value")).toHaveText("30.0");
  await expect(page.locator("#bmi-label")).toHaveText("肥満（2度）");

  // 境界値 35.0 → 肥満（3度）
  await page.fill("#weight", "35");
  await expect(page.locator("#bmi-value")).toHaveText("35.0");
  await expect(page.locator("#bmi-label")).toHaveText("肥満（3度）");

  // 境界値 40.0 → 肥満（4度）
  await page.fill("#weight", "40");
  await expect(page.locator("#bmi-value")).toHaveText("40.0");
  await expect(page.locator("#bmi-label")).toHaveText("肥満（4度）");
});

test("入力変更のたびにBMI値と判定が再計算される", async ({ page }) => {
  await page.goto(APP_URL);
  await page.fill("#height", "170");
  await page.fill("#weight", "60");
  await expect(page.locator("#bmi-value")).toHaveText("20.8");
  await expect(page.locator("#bmi-label")).toHaveText("普通体重");

  await page.fill("#weight", "80");
  await expect(page.locator("#bmi-value")).toHaveText("27.7");
  await expect(page.locator("#bmi-label")).toHaveText("肥満（1度）");
});

test("未入力または0以下の場合はプレースホルダが表示される", async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator("#result")).toHaveText("身長と体重を入力してください");

  await page.fill("#height", "170");
  await expect(page.locator("#result")).toHaveText("身長と体重を入力してください");

  await page.fill("#weight", "60");
  await expect(page.locator("#bmi-value")).toBeVisible();

  await page.fill("#weight", "0");
  await expect(page.locator("#result")).toHaveText("身長と体重を入力してください");

  await page.fill("#weight", "60");
  await page.fill("#height", "");
  await expect(page.locator("#result")).toHaveText("身長と体重を入力してください");
});

test("有効入力時に判定区分の帯と境界目盛りがBMI 15〜45の横軸で表示される", async ({ page }) => {
  await page.goto(APP_URL);
  await page.fill("#height", "170");
  await page.fill("#weight", "60");

  const scale = page.locator("#result #bmi-scale");
  await expect(scale).toBeVisible();
  await expect(scale.locator(".bmi-band")).toHaveText([
    "低体重",
    "普通体重",
    "肥満（1度）",
    "肥満（2度）",
    "肥満（3度）",
    "肥満（4度）",
  ]);
  await expect(scale.locator(".bmi-tick")).toHaveText(["18.5", "25", "30", "35", "40"]);

  const widths = await scale.locator(".bmi-band").evaluateAll((els) => {
    const parentWidth = els[0].parentElement.getBoundingClientRect().width;
    return els.map((el) => el.getBoundingClientRect().width / parentWidth);
  });
  const expected = [3.5, 6.5, 5, 5, 5, 5].map((span) => span / 30);
  expect(widths.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(widths[i]).toBeCloseTo(expected[i], 1);
  }
});

test("帯の強調区分は現在の判定ラベルと一致し入力変更に追従する", async ({ page }) => {
  await page.goto(APP_URL);
  await page.fill("#height", "100");
  await page.fill("#weight", "18.5");

  const current = page.locator("#bmi-scale .is-current");
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText("普通体重");
  await expect(page.locator("#bmi-label")).toHaveText("普通体重");

  await page.fill("#weight", "25");
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText("肥満（1度）");
  await expect(page.locator("#bmi-label")).toHaveText("肥満（1度）");
});

test("現在地マーカーはBMI 15〜45の線形位置に置かれaria-valuenowは表示値と一致する", async ({ page }) => {
  await page.goto(APP_URL);
  await page.fill("#height", "100");

  await page.fill("#weight", "24");
  const marker = page.locator("#bmi-scale #bmi-marker");
  await expect(marker).toBeVisible();
  expect(await marker.evaluate((el) => el.style.left)).toBe("30%");
  await expect(marker).toHaveAttribute("aria-valuenow", await page.locator("#bmi-value").innerText());

  await page.fill("#weight", "30");
  expect(await marker.evaluate((el) => el.style.left)).toBe("50%");
  await expect(marker).toHaveAttribute("aria-valuenow", await page.locator("#bmi-value").innerText());

  await page.fill("#weight", "60");
  expect(await marker.evaluate((el) => el.style.left)).toBe("100%");
  await expect(marker).toHaveAttribute("aria-valuenow", await page.locator("#bmi-value").innerText());
});

test("無効入力では帯とマーカーがなくプレースホルダだけを表示する", async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator("#result")).toHaveText("身長と体重を入力してください");
  await expect(page.locator("#bmi-scale")).toHaveCount(0);
  await expect(page.locator("#bmi-marker")).toHaveCount(0);

  await page.fill("#height", "170");
  await page.fill("#weight", "0");
  await expect(page.locator("#result")).toHaveText("身長と体重を入力してください");
  await expect(page.locator("#bmi-scale")).toHaveCount(0);
  await expect(page.locator("#bmi-marker")).toHaveCount(0);

  await page.fill("#weight", "60");
  await page.fill("#height", "");
  await expect(page.locator("#result")).toHaveText("身長と体重を入力してください");
  await expect(page.locator("#bmi-scale")).toHaveCount(0);
  await expect(page.locator("#bmi-marker")).toHaveCount(0);
});

test("フッターにapps.jozo.beerへのリンクが表示される", async ({ page }) => {
  await page.goto(APP_URL);
  const link = page.locator('footer a[href="https://apps.jozo.beer"]');
  await expect(link).toBeVisible();
  await expect(link).toHaveText("apps.jozo.beer");
});

test("meta description が空でない", async ({ page }) => {
  await page.goto(APP_URL);
  const content = await page.locator('meta[name="description"]').getAttribute("content");
  expect(content).toBeTruthy();
  expect(content!.trim().length).toBeGreaterThan(0);
});

test("JSON-LD に WebApplication が含まれる", async ({ page }) => {
  await page.goto(APP_URL);
  const texts = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(texts.length).toBeGreaterThan(0);

  const nodes = texts.flatMap((text) => {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
  const app = nodes.find(
    (n) => n["@type"] === "WebApplication" || (Array.isArray(n["@type"]) && n["@type"].includes("WebApplication")),
  );
  expect(app).toBeTruthy();
  expect(app.name).toBeTruthy();
  expect(app.description).toBeTruthy();
  expect(app.url).toBeTruthy();
  expect(app.applicationCategory).toBeTruthy();
  expect(app.offers?.price).toBe("0");
});

test("使い方とFAQのセクションが存在する", async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator("#how-to")).toBeVisible();
  await expect(page.locator("#faq")).toBeVisible();
});
