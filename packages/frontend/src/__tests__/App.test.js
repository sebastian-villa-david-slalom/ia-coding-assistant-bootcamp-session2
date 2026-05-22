import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

window.confirm = jest.fn(() => true);

const initialTodos = [
  {
    id: 1,
    title: 'Pay utilities',
    description: 'Electricity and internet bills',
    dueDate: '2026-06-15',
    completed: false,
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Schedule dentist',
    description: '',
    dueDate: null,
    completed: true,
    createdAt: '2026-05-19T10:00:00.000Z',
    updatedAt: '2026-05-19T10:00:00.000Z',
  },
];

let todos = [];
let nextId = 3;
let apiErrors = {};

function resetApiState() {
  todos = initialTodos.map((todo) => ({ ...todo }));
  nextId = 3;
  apiErrors = {
    get: null,
    post: null,
    put: null,
    patch: null,
    delete: null,
  };
}

resetApiState();

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    if (apiErrors.get) {
      return res(ctx.status(500), ctx.json({ error: apiErrors.get }));
    }

    return res(ctx.status(200), ctx.json(todos));
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    if (apiErrors.post) {
      return res(ctx.status(500), ctx.json({ error: apiErrors.post }));
    }

    const { title, description, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    const createdTodo = {
      id: nextId,
      title: title.trim(),
      description: description || null,
      dueDate: dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    nextId += 1;
    todos.push(createdTodo);

    return res(ctx.status(201), ctx.json(createdTodo));
  }),

  rest.put('/api/todos/:id', (req, res, ctx) => {
    if (apiErrors.put) {
      return res(ctx.status(500), ctx.json({ error: apiErrors.put }));
    }

    const id = Number(req.params.id);
    const foundTodo = todos.find((todo) => todo.id === id);

    if (!foundTodo) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    const { title, description, dueDate } = req.body;
    foundTodo.title = title;
    foundTodo.description = description || null;
    foundTodo.dueDate = dueDate || null;
    foundTodo.updatedAt = new Date().toISOString();

    return res(ctx.status(200), ctx.json({ ...foundTodo }));
  }),

  rest.patch('/api/todos/:id/status', (req, res, ctx) => {
    if (apiErrors.patch) {
      return res(ctx.status(500), ctx.json({ error: apiErrors.patch }));
    }

    const { id } = req.params;
    const { completed } = req.body;
    const foundTodo = todos.find((todo) => todo.id === Number(id));

    if (!foundTodo) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    foundTodo.completed = completed;
    foundTodo.updatedAt = new Date().toISOString();

    return res(ctx.status(200), ctx.json({ ...foundTodo }));
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    if (apiErrors.delete) {
      return res(ctx.status(500), ctx.json({ error: apiErrors.delete }));
    }

    const id = Number(req.params.id);
    todos = todos.filter((todo) => todo.id !== id);

    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: Number(req.params.id) }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  resetApiState();
  window.confirm.mockReturnValue(true);
});
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByRole('heading', { name: 'Task planner' })).toBeInTheDocument();
    expect(screen.getByText(/Track tasks, due dates, and completion state/i)).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
      expect(screen.getByText('Schedule dentist')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', { name: /task title/i });
    await act(async () => {
      await user.type(input, 'Prepare roadmap draft');
    });

    const submitButton = screen.getByRole('button', { name: 'Add task' });
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Prepare roadmap draft')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    apiErrors.get = 'Unable to load tasks right now.';

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Unable to load tasks right now/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    todos = [];

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No tasks to show')).toBeInTheDocument();
    });
  });

  test('filters tasks by status', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Completed' }));
    });

    expect(screen.getByText('Schedule dentist')).toBeInTheDocument();
    expect(screen.queryByText('Pay utilities')).not.toBeInTheDocument();
  });

  test('deletes a task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'delete Pay utilities' });

    await act(async () => {
      await user.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Pay utilities')).not.toBeInTheDocument();
    });
  });

  test('shows validation when creating a task without title', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add task' }));
    });

    expect(screen.getByText('Task title is required.')).toBeInTheDocument();
  });

  test('handles API error when creating a task', async () => {
    const user = userEvent.setup();
    apiErrors.post = 'Failed to create task from API';

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    await act(async () => {
      await user.type(screen.getByRole('textbox', { name: /task title/i }), 'Task with API error');
      await user.click(screen.getByRole('button', { name: 'Add task' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to create task from API')).toBeInTheDocument();
    });
  });

  test('edits an existing task successfully', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'edit Pay utilities' }));
    });

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    await act(async () => {
      await user.clear(titleInput);
      await user.type(titleInput, 'Pay utilities updated');
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities updated')).toBeInTheDocument();
    });
  });

  test('shows validation when editing a task without title', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'edit Pay utilities' }));
    });

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    await act(async () => {
      await user.clear(titleInput);
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
    });

    expect(screen.getByText('Task title is required.')).toBeInTheDocument();
  });

  test('handles API error when updating a task', async () => {
    const user = userEvent.setup();
    apiErrors.put = 'Failed to update task from API';

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'edit Pay utilities' }));
    });

    const saveButton = await screen.findByRole('button', { name: 'Save changes' });

    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to update task from API')).toBeInTheDocument();
    });
  });

  test('toggles a task status and shows API error on toggle failure', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('checkbox', { name: 'mark Pay utilities as complete' }));
    });

    expect(screen.getByRole('checkbox', { name: 'mark Pay utilities as incomplete' })).toBeInTheDocument();

    apiErrors.patch = 'Failed to toggle task status';

    await act(async () => {
      await user.click(screen.getByRole('checkbox', { name: 'mark Pay utilities as incomplete' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to toggle task status')).toBeInTheDocument();
    });
  });

  test('keeps current filter when re-clicking selected filter option', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'All' }));
    });

    expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    expect(screen.getByText('Schedule dentist')).toBeInTheDocument();
  });

  test('shows API error when deleting fails', async () => {
    const user = userEvent.setup();
    apiErrors.delete = 'Delete failed from API';

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Pay utilities')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'delete Pay utilities' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Delete failed from API')).toBeInTheDocument();
    });
  });
});