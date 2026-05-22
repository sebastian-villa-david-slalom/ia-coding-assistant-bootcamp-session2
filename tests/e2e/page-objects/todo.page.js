class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByRole('textbox', { name: 'Task title' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Description' });
    this.dueDateInput = page.getByLabel('Due date').first();
    this.addButton = page.getByRole('button', { name: 'Add task' });
    this.activeFilter = page.getByRole('button', { name: 'Active' });
    this.completedFilter = page.getByRole('button', { name: 'Completed' });
    this.allFilter = page.getByRole('button', { name: 'All' });
  }

  async goto() {
    await this.page.goto('/');
    await this.page.getByRole('heading', { name: 'Task planner' }).waitFor();
  }

  async addTask({ title, description, dueDate }) {
    await this.titleInput.fill(title);
    if (description) {
      await this.descriptionInput.fill(description);
    }
    if (dueDate) {
      await this.dueDateInput.fill(dueDate);
    }
    await this.addButton.click();
  }

  taskTitle(title) {
    return this.page.getByRole('heading', { name: title, level: 6 });
  }

  completeTask(title) {
    return this.page.getByRole('checkbox', { name: `mark ${title} as complete` });
  }

  reopenTask(title) {
    return this.page.getByRole('checkbox', { name: `mark ${title} as incomplete` });
  }

  deleteTaskButton(title) {
    return this.page.getByRole('button', { name: `delete ${title}` });
  }
}

module.exports = { TodoPage };