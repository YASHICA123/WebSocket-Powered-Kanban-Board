import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the board with columns', async ({ page }) => {
    // Wait for board to load
    await expect(page.locator('text=Kanban Board')).toBeVisible();
    await expect(page.locator('text=To Do')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
  });

  test('should add a task to a column', async ({ page }) => {
    // Click the "Add Task" button in the first column (To Do)
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    // Fill in task title
    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('My First Task');

    // Click Add button
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    // Verify task appears
    await expect(page.locator('text=My First Task')).toBeVisible();
  });

  test('should add a task with description', async ({ page }) => {
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    const descInput = page.locator('input[placeholder="Description (optional)"]').first();

    await titleInput.fill('Complex Task');
    await descInput.fill('This task has a description');

    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    await expect(page.locator('text=Complex Task')).toBeVisible();
    await expect(page.locator('text=This task has a description')).toBeVisible();
  });

  test('should cancel adding a task', async ({ page }) => {
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Task to cancel');

    const cancelButton = page.locator('button:has-text("Cancel")').first();
    await cancelButton.click();

    // The input should disappear
    await expect(page.locator('input[placeholder="Task title"]')).not.toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Add a task first
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Task to delete');

    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    // Hover over task to reveal delete button
    const taskCard = page.locator('text=Task to delete').first();
    await taskCard.hover();

    // Click delete button (trash icon)
    const deleteButton = page.locator('button svg[class*="trash"]').first().locator('..').first();
    await deleteButton.click();

    // Task should be gone
    await expect(page.locator('text=Task to delete')).not.toBeVisible();
  });

  test('should set priority and category', async ({ page }) => {
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Priority task');

    await page.locator('[data-testid="priority-select"]').first().click();
    await page.locator('text=High').click();

    await page.locator('[data-testid="category-select"]').first().click();
    await page.locator('text=Bug').click();

    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    await expect(page.locator('text=Priority task')).toBeVisible();
    await expect(page.locator('text=high')).toBeVisible();
    await expect(page.locator('text=bug')).toBeVisible();
  });

  test('should upload an attachment', async ({ page }) => {
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Attachment task');

    const fileInput = page.locator('[data-testid="attachment-input"]').first();
    await fileInput.setInputFiles({
      name: 'sample.png',
      mimeType: 'image/png',
      buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    });

    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    await expect(page.locator('text=Attachment task')).toBeVisible();
    await expect(page.locator('text=sample.png')).toBeVisible();
  });

  test('should reject invalid attachment types', async ({ page }) => {
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const fileInput = page.locator('[data-testid="attachment-input"]').first();
    await fileInput.setInputFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('invalid'),
    });

    await expect(page.locator('text=Unsupported file type')).toBeVisible();
  });

  test('should update charts when tasks change', async ({ page }) => {
    await expect(page.locator('[data-testid="task-progress-charts"]')).toBeVisible();

    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Charted task');

    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    await expect(page.locator('text=Charted task')).toBeVisible();
  });

  test('should sync tasks between clients in real time', async ({ page, context }) => {
    const pageTwo = await context.newPage();
    await pageTwo.goto('/');
    await expect(pageTwo.locator('text=Kanban Board')).toBeVisible();

    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Real-time task');

    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    await expect(pageTwo.locator('text=Real-time task')).toBeVisible();
  });

  test('should drag and drop task between columns', async ({ page }) => {
    // Add a task to To Do column
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Task to move');

    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    // Wait for task to appear
    const taskCard = page.locator('text=Task to move').first();
    await expect(taskCard).toBeVisible();

    // Get the In Progress column drop zone
    const columns = page.locator('[data-column-id]');
    const inProgressColumn = columns.nth(1); // Second column is In Progress

    // Drag task from To Do to In Progress
    await taskCard.dragTo(inProgressColumn);

    // Verify task is in In Progress column
    await expect(inProgressColumn.locator('text=Task to move')).toBeVisible();
  });

  test('should show task count in column headers', async ({ page }) => {
    // Add a task
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Counted task');

    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    // Check task count
    const todoHeader = page.locator('text=To Do').first();
    await expect(todoHeader.locator('text=/\\d+ tasks/')).toBeVisible();
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Enter test task');

    // Press Enter to submit
    await titleInput.press('Enter');

    // Task should be added
    await expect(page.locator('text=Enter test task')).toBeVisible();
  });

  test('should close add task form with Escape', async ({ page }) => {
    const addTaskButtons = page.locator('button:has-text("Add Task")');
    await addTaskButtons.first().click();

    const titleInput = page.locator('input[placeholder="Task title"]').first();
    await titleInput.fill('Task to cancel with escape');

    // Press Escape
    await titleInput.press('Escape');

    // Form should close
    await expect(page.locator('input[placeholder="Task title"]')).not.toBeVisible();
  });
});
