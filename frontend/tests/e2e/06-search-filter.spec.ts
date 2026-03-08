import { test, expect } from "@playwright/test"
import { signIn, goToTodos, openAddDialog, fillAndSubmitTask } from "./helpers"

/**
 * E2E Flow 6: Search and filter tasks
 * Steps: add 2 tasks → search for one → only matching task visible → clear → both visible
 */
test.describe("Search and filter", () => {
  const task1 = `Alpha-Task-${Date.now()}`
  const task2 = `Beta-Task-${Date.now()}`

  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await goToTodos(page)

    // Seed two tasks
    await openAddDialog(page)
    await fillAndSubmitTask(page, task1)
    await expect(page.getByText(task1)).toBeVisible({ timeout: 8_000 })

    await openAddDialog(page)
    await fillAndSubmitTask(page, task2)
    await expect(page.getByText(task2)).toBeVisible({ timeout: 8_000 })
  })

  test("should filter results by search query", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: /search/i })
    await searchInput.fill("Alpha")

    await expect(page.getByText(task1)).toBeVisible()
    await expect(page.getByText(task2)).not.toBeVisible()
  })

  test("should show all tasks when search is cleared", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: /search/i })
    await searchInput.fill("Alpha")
    await expect(page.getByText(task2)).not.toBeVisible()

    await searchInput.clear()
    await expect(page.getByText(task1)).toBeVisible()
    await expect(page.getByText(task2)).toBeVisible()
  })

  test("should show empty state for no matching query", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: /search/i })
    await searchInput.fill("ZZZnonexistent999")

    await expect(page.getByText(/no tasks match/i)).toBeVisible()
  })
})
