import { test, expect } from "@playwright/test";
import * as fs from "fs";

test("load page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /upload/i })).toBeVisible();
});

test("upload without file", async ({ page }) => {
  await page.goto("/");
  const uploadButton = await page.getByRole("button", { name: /upload/i });
  await uploadButton.click();
  const errorMessage = await page.getByText("A CSV file is required");
  await expect(errorMessage).toBeVisible();
});

test("upload file with different extension than csv", async ({ page }) => {
  await page.goto("/");
  await page.click('input[type="file"][name="file"]');
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.click('input[type="file"][name="file"]'),
  ]);
  fileChooser.setFiles("tests-files/data.txt");
  const uploadButton = await page.getByRole("button", { name: /upload/i });
  await uploadButton.click();
  const errorMessage = await page.getByText("A CSV file is required");
  await expect(errorMessage).toBeVisible();
});

test("upload csv file and check uploaded data", async ({ page }) => {
  await page.goto("/");
  await page.click('input[type="file"][name="file"]');
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.click('input[type="file"][name="file"]'),
  ]);
  fileChooser.setFiles("tests-files/data.csv");
  const uploadButton = await page.getByRole("button", { name: /upload/i });
  const oldCardsCount = (await page.locator(".card").all()).length;
  await uploadButton.click();
  const successMessage = await page.getByText("File successful loaded");
  await expect(successMessage).toBeVisible();
  await page.waitForTimeout(5000);
  const fileContent = await fs.promises.readFile(
    "tests-files/data.csv",
    "utf-8"
  );
  //remove header
  const lineCount = fileContent.split("\n").length - 1;

  const newCardsCount = (await page.locator(".card").all()).length;
  await expect(newCardsCount - oldCardsCount).toBe(lineCount);
});

test("Filter by not existing data", async ({ page }) => {
  await page.goto("/");
  await page.fill('input[type="search"]', "exanple");
  const successMessage = await page.getByText(
    "There were no results for exanple"
  );
  await expect(successMessage).toBeVisible();
});

test("Filter by existing data, Jane", async ({ page }) => {
  await page.goto("/");
  await page.fill('input[type="search"]', "Jane");
  await page.waitForTimeout(5000);
  const filteredCards = await page.locator('.card:has-text("Jane")').all();
  const visibleCards = (await page.locator(".card").all()).length;
  await expect(filteredCards.length).toBe(visibleCards);
});
