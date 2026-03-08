import { test, expect } from "@playwright/test"
import { signIn, goToTodos, openAddDialog, fillAndSubmitTask } from "./helpers"

/**
 * E2E Flow 2: Edit an existing task
 * Steps: add task → click edit → change title → save → updated title visible
 */
test.describe("Edit task", () => {
  const originalTitle = `Edit-Seed-${Date.now()}`
  const updatedTitle  = `Updated-${Date.now()}`

  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await goToTodos(page)
    // Seed a task to edit
    await openAddDialog(page)
    await fillAndSubmitTask(page, originalTitle)
    await expect(page.getByText(originalTitle)).toBeVisible({ timeout: 8_000 })
  })

  test("should edit a task title and reflect changes", async ({ page }) => {
    // Click the edit button on the seeded task card
    const taskCard = page.locator("div", { hasText: originalTitle }).first()
    const editBtn = taskCard.getByRole("button", { name: /edit/i })
    await editBtn.click()

    // Dialog should open in edit mode
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText(/edit task/i)).toBeVisible()

    // Clear and re-fill the title
    const titleInput = page.locator('input[id="title"]')
    await titleInput.clear()
    await titleInput.fill(updatedTitle)

    await page.getByRole("button", { name: /save changes/i }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible()

    // Updated title should appear
    await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 8_000 })
  })
})
