import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

window.confirm = jest.fn(() => true);

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
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
      ])
    );
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const { title, description, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title,
        description: description || null,
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),

  rest.patch('/api/todos/:id/status', (req, res, ctx) => {
    const { id } = req.params;
    const { completed } = req.body;

    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        title: 'Pay utilities',
        description: 'Electricity and internet bills',
        dueDate: '2026-06-15',
        completed,
        createdAt: '2026-05-20T10:00:00.000Z',
        updatedAt: new Date().toISOString(),
      })
    );
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: Number(req.params.id) }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
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
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Unable to load tasks right now/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

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
});