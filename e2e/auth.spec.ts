import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("landing page renders with sign in and get started links", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: /financial life/i })).toBeVisible()
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
  })

  test("shows a validation error for an invalid login", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[name="email"]').fill("demo@example.com")
    await page.locator('input[name="password"]').fill("wrong-password")
    await page.click('button[type="submit"]')
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({
      timeout: 15_000,
    })
  })

  test("logs in successfully and reaches the dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[name="email"]').fill("demo@example.com")
    await page.locator('input[name="password"]').fill("Demo1234!")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard", { timeout: 100_000 })
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible()
    await expect(page.getByText("Total balance")).toBeVisible({ timeout: 15_000 })
  })

  test("protected routes redirect to login when signed out", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL("**/login**", { timeout: 30_000 })
  })
})
