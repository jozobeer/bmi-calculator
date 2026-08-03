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

test("フッターにapps.jozo.beerへのリンクが表示される", async ({ page }) => {
  await page.goto(APP_URL);
  const link = page.locator('footer a[href="https://apps.jozo.beer"]');
  await expect(link).toBeVisible();
  await expect(link).toHaveText("apps.jozo.beer");
});
