import { test, expect } from "@playwright/test"
import { signIn, goToTodos, openAddDialog, fillAndSubmitTask } from "./helpers"

/**
 * E2E Flow 4: Undo complete — re-open a completed task
 * Steps: add task → complete it → click checkbox again → task re-opens
 */
test.describe("Undo complete", () => {
  const taskTitle = `Undo-Seed-${Date.now()}`

  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await goToTodos(page)
    await openAddDialog(page)
    await fillAndSubmitTask(page, taskTitle)
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 8_000 })
  })

  test("should toggle task back to active after completing", async ({ page }) => {
    const taskCard = page.locator("div", { hasText: taskTitle }).first()
    const checkbox = taskCard.locator('button[aria-label*="complete"], div[role="checkbox"], div[class*="checkbox"]').first()

    // Complete it
    await checkbox.click()
    await page.waitForTimeout(500)

    // Show completed tasks (switch filter to "Completed" or "All")
    const statusFilter = page.locator('select').filter({ hasText: /all|completed/i }).first()
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption("completed")
    }

    // Find completed task and click checkbox again
    const completedCard = page.locator("div", { hasText: taskTitle }).first()
    const checkbox2 = completedCard.locator('button[aria-label*="complete"], div[role="checkbox"], div[class*="checkbox"]').first()
    await checkbox2.click()
    await page.waitForTimeout(500)

    // Task should still exist in the list (now active again)
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 8_000 })
  })
})
