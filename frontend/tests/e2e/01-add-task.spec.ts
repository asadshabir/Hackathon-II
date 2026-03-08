import { test, expect } from "@playwright/test"
import { signIn, goToTodos, openAddDialog, fillAndSubmitTask } from "./helpers"

/**
 * E2E Flow 1: Add a new task
 * Steps: sign in → todos → open dialog → fill title → submit → task appears in list
 */
test.describe("Add task", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await goToTodos(page)
  })

  test("should add a new task and see it in the list", async ({ page }) => {
    const title = `E2E Task ${Date.now()}`

    await openAddDialog(page)

    // Dialog is visible
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText(/create new task/i)).toBeVisible()

    await fillAndSubmitTask(page, title)

    // Task appears in the list
    await expect(page.getByText(title)).toBeVisible({ timeout: 8_000 })
  })

  test("should show validation error when title is empty", async ({ page }) => {
    await openAddDialog(page)
    await page.getByRole("button", { name: /create task/i }).click()
    // Error message should appear
    await expect(page.getByText(/title is required/i)).toBeVisible()
  })

  test("dialog closes on cancel", async ({ page }) => {
    await openAddDialog(page)
    await page.getByRole("button", { name: /cancel/i }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })
})
