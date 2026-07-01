import { test, expect } from "@playwright/test"

test.describe("Transactions CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[name="email"]').fill("demo@example.com")
    await page.locator('input[name="password"]').fill("Demo1234!")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard", { timeout: 100_000 })
  })

  test("creates a new expense transaction and sees it in the list", async ({ page }) => {
    await page.goto("/transactions")
    await page.getByRole("button", { name: /add transaction/i }).click()

    const description = `E2E test expense ${Date.now()}`
    await page.locator('input[name="description"]').fill(description)
    await page.locator('input[name="amount"]').fill("12.34")

    // Category has no default value — pick the first option explicitly.
    await page.getByRole("combobox", { name: /select category/i }).click()
    await page.getByRole("option").first().click()

    await page.getByRole("button", { name: /^add transaction$/i }).click()

    await expect(page.getByText(description)).toBeVisible({ timeout: 15_000 })
  })
})
