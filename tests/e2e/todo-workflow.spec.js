const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./page-objects/todo.page');

test.describe('TODO workflow', () => {
  test('user can add, complete, filter, and delete a task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const taskTitle = `E2E task ${Date.now()}`;

    await todoPage.goto();

    await todoPage.addTask({
      title: taskTitle,
      description: 'Critical workflow validation',
      dueDate: '2026-07-15',
    });

    await expect(todoPage.taskTitle(taskTitle)).toBeVisible();

    await todoPage.completeTask(taskTitle).click();
    await expect(todoPage.reopenTask(taskTitle)).toBeVisible();

    await todoPage.completedFilter.click();
    await expect(todoPage.taskTitle(taskTitle)).toBeVisible();

    await todoPage.allFilter.click();
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await todoPage.deleteTaskButton(taskTitle).click();

    await expect(todoPage.taskTitle(taskTitle)).not.toBeVisible();
  });
});