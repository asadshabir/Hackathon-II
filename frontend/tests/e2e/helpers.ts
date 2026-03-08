import { Page } from "@playwright/test"

/** Sign in with test credentials and wait for dashboard */
export async function signIn(page: Page) {
  await page.goto("/signin")
  await page.fill('input[type="email"]', process.env.E2E_EMAIL ?? "test@example.com")
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD ?? "testpassword123")
  await page.click('button[type="submit"]')
  await page.waitForURL("**/dashboard**", { timeout: 15_000 })
}

/** Navigate to the todos page */
export async function goToTodos(page: Page) {
  await page.goto("/dashboard/todos")
  await page.waitForSelector('[data-testid="todo-list"], .animate-fade-in', { timeout: 10_000 })
}

/** Open the "Add Task" dialog */
export async function openAddDialog(page: Page) {
  const addBtn = page.getByRole("button", { name: /add task/i })
  await addBtn.click()
  await page.waitForSelector('[role="dialog"]', { state: "visible" })
}

/** Create a task with the given title (dialog must already be open) */
export async function fillAndSubmitTask(page: Page, title: string) {
  await page.fill('input[id="title"]', title)
  await page.getByRole("button", { name: /create task/i }).click()
  await page.waitForSelector('[role="dialog"]', { state: "hidden" })
}
