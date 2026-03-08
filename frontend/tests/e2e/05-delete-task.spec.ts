import { test, expect } from "@playwright/test"
import { signIn, goToTodos, openAddDialog, fillAndSubmitTask } from "./helpers"

/**
 * E2E Flow 5: Delete a task (with confirmation)
 * Steps: add task → click delete → confirm → task removed from list
 */
test.describe("Delete task", () => {
  const taskTitle = `Delete-Seed-${Date.now()}`

  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await goToTodos(page)
    await openAddDialog(page)
    await fillAndSubmitTask(page, taskTitle)
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 8_000 })
  })

  test("should delete a task after confirmation", async ({ page }) => {
    // Accept the confirm() dialog that the app triggers
    page.on("dialog", (dialog) => dialog.accept())

    const taskCard = page.locator("div", { hasText: taskTitle }).first()
    const deleteBtn = taskCard.getByRole("button", { name: /delete/i })
    await deleteBtn.click()

    // Task should be removed
    await expect(page.getByText(taskTitle)).not.toBeVisible({ timeout: 8_000 })
  })

  test("should NOT delete task when confirmation is dismissed", async ({ page }) => {
    // Dismiss the confirm() dialog
    page.on("dialog", (dialog) => dialog.dismiss())

    const taskCard = page.locator("div", { hasText: taskTitle }).first()
    const deleteBtn = taskCard.getByRole("button", { name: /delete/i })
    await deleteBtn.click()

    // Task should still be visible
    await expect(page.getByText(taskTitle)).toBeVisible()
  })
})
