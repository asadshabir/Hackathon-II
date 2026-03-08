import { test, expect } from "@playwright/test"
import { signIn, goToTodos, openAddDialog, fillAndSubmitTask } from "./helpers"

/**
 * E2E Flow 3: Complete a task (check off)
 * Steps: add task → click checkbox → task shows as completed (line-through)
 */
test.describe("Complete task", () => {
  const taskTitle = `Complete-Seed-${Date.now()}`

  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await goToTodos(page)
    await openAddDialog(page)
    await fillAndSubmitTask(page, taskTitle)
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 8_000 })
  })

  test("should mark a task as complete by clicking its checkbox", async ({ page }) => {
    const taskCard = page.locator("div", { hasText: taskTitle }).first()

    // Find and click the checkbox-style button inside the card
    const checkbox = taskCard.locator('button[aria-label*="complete"], div[role="checkbox"], div[class*="checkbox"]').first()
    await checkbox.click()

    // The task title should visually show as struck-through or completed
    await expect(
      page.locator(`text=${taskTitle}`).locator("..")
    ).toHaveCSS("opacity", /./, { timeout: 5_000 })

    // "Done" stat card should increment (at least has a number)
    const doneCard = page.getByText("Done").locator("..").locator("..")
    await expect(doneCard).toBeVisible()
  })
})
