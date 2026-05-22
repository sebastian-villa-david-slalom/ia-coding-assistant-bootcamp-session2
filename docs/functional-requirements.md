# Functional Requirements

This document defines the core functional requirements for the TODO application. The intent is to make the expected behavior explicit so implementation and testing can follow the same rules.

## Core Requirements

1. The user can create a new task by entering a title and submitting the form.
2. A task must have a non-empty title. The application must prevent creating a task without one.
3. The user can optionally add a description to a task.
4. The user can optionally assign a due date to a task.
5. The user can edit an existing task, including its title, description, and due date.
6. The user can mark a task as complete.
7. The user can mark a completed task as incomplete.
8. The user can delete a task.
9. The application must display all existing tasks in a task list.
10. Tasks must be sorted in a predictable order:
    - incomplete tasks first
    - then completed tasks
    - within each group, tasks with the nearest due date first
    - tasks without a due date last
11. The user can clearly distinguish completed tasks from incomplete tasks in the interface.
12. The user can filter the task list by status:
    - all tasks
    - active tasks
    - completed tasks
13. The user can view overdue tasks and distinguish them from tasks that are not overdue.
14. The application must preserve tasks between sessions so that refreshing or reopening the app does not lose existing data.
15. Changes to a task, including create, edit, complete, uncomplete, and delete actions, must be reflected in the task list immediately.

## Behavioral Notes

- A task is considered overdue when it has a due date in the past and is not marked complete.
- If two tasks have the same completion state and due date, they should keep a stable order based on creation time.
- Editing a task must not create a duplicate task.
- Deleting a task must permanently remove it from the displayed list and stored data.