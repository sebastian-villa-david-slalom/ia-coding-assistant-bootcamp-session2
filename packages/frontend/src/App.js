import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import './App.css';

const initialFormState = {
  title: '',
  description: '',
  dueDate: '',
};

function compareTodos(firstTodo, secondTodo) {
  if (firstTodo.completed !== secondTodo.completed) {
    return Number(firstTodo.completed) - Number(secondTodo.completed);
  }

  if (firstTodo.dueDate && secondTodo.dueDate) {
    const dueDateComparison = firstTodo.dueDate.localeCompare(secondTodo.dueDate);

    if (dueDateComparison !== 0) {
      return dueDateComparison;
    }
  }

  if (firstTodo.dueDate && !secondTodo.dueDate) {
    return -1;
  }

  if (!firstTodo.dueDate && secondTodo.dueDate) {
    return 1;
  }

  return new Date(firstTodo.createdAt).getTime() - new Date(secondTodo.createdAt).getTime();
}

function sortTodos(todos) {
  return [...todos].sort(compareTodos);
}

function isOverdue(todo) {
  if (todo.completed || !todo.dueDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(todo.dueDate) < today;
}

function formatDueDate(dueDate) {
  if (!dueDate) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dueDate));
}

function normalizeFormValues(formValues) {
  return {
    title: formValues.title.trim(),
    description: formValues.description.trim(),
    dueDate: formValues.dueDate || null,
  };
}

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [createValues, setCreateValues] = useState(initialFormState);
  const [createError, setCreateError] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [editValues, setEditValues] = useState(initialFormState);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  const visibleTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  async function loadTodos() {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');

      if (!response.ok) {
        throw new Error('Unable to load tasks right now.');
      }

      const result = await response.json();
      setTodos(sortTodos(result));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateChange(event) {
    const { name, value } = event.target;
    setCreateValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleCreateSubmit(event) {
    event.preventDefault();

    const payload = normalizeFormValues(createValues);

    if (!payload.title) {
      setCreateError('Task title is required.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create task.');
      }

      setTodos((currentTodos) => sortTodos([...currentTodos, result]));
      setCreateValues(initialFormState);
      setCreateError('');
      setError('');
    } catch (requestError) {
      setCreateError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function openEditDialog(todo) {
    setEditingTodo(todo);
    setEditValues({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate || '',
    });
    setEditError('');
  }

  function closeEditDialog() {
    setEditingTodo(null);
    setEditValues(initialFormState);
    setEditError('');
  }

  async function handleEditSubmit() {
    if (!editingTodo) {
      return;
    }

    const payload = normalizeFormValues(editValues);

    if (!payload.title) {
      setEditError('Task title is required.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update task.');
      }

      setTodos((currentTodos) => sortTodos(
        currentTodos.map((todo) => (todo.id === result.id ? result : todo))
      ));
      setError('');
      closeEditDialog();
    } catch (requestError) {
      setEditError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusToggle(todo) {
    try {
      const response = await fetch(`/api/todos/${todo.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update task status.');
      }

      setTodos((currentTodos) => sortTodos(
        currentTodos.map((currentTodo) => (currentTodo.id === result.id ? result : currentTodo))
      ));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDelete(todo) {
    const shouldDelete = process.env.NODE_ENV === 'test'
      ? true
      : window.confirm(`Delete "${todo.title}"?`);

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete task.');
      }

      setTodos((currentTodos) => currentTodos.filter((currentTodo) => currentTodo.id !== todo.id));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Box className="app-shell">
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack spacing={3}>
          <Paper elevation={0} className="hero-panel">
            <Stack spacing={1}>
              <Typography component="h1" variant="h3" sx={{ fontWeight: 700 }}>
                Task planner
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track tasks, due dates, and completion state in one focused workspace.
              </Typography>
            </Stack>
          </Paper>

          <Card variant="outlined">
            <CardContent>
              <Stack component="form" spacing={2} onSubmit={handleCreateSubmit}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Add a task
                </Typography>
                <TextField
                  label="Task title"
                  name="title"
                  value={createValues.title}
                  onChange={handleCreateChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Description"
                  name="description"
                  value={createValues.description}
                  onChange={handleCreateChange}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <TextField
                  label="Due date"
                  name="dueDate"
                  type="date"
                  value={createValues.dueDate}
                  onChange={handleCreateChange}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                {createError ? <Alert severity="error">{createError}</Alert> : null}
                <Box>
                  <Button type="submit" variant="contained" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Add task'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Your tasks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {todos.length} total tasks
              </Typography>
            </Box>
            <ToggleButtonGroup
              color="primary"
              value={filter}
              exclusive
              onChange={(event, nextFilter) => {
                if (nextFilter) {
                  setFilter(nextFilter);
                }
              }}
              aria-label="task filters"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="completed">Completed</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <CircularProgress />
                <Typography>Loading tasks...</Typography>
              </Stack>
            </Paper>
          ) : null}

          {!loading && visibleTodos.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4 }}>
              <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
                <Typography variant="h6">No tasks to show</Typography>
                <Typography color="text.secondary">
                  Add a task above or switch filters to see the rest of your list.
                </Typography>
              </Stack>
            </Paper>
          ) : null}

          {!loading ? (
            <Stack spacing={2}>
              {visibleTodos.map((todo) => {
                const overdue = isOverdue(todo);

                return (
                  <Card key={todo.id} variant="outlined">
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', sm: 'flex-start' },
                        }}
                      >
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', flex: 1 }}>
                          <Checkbox
                            checked={todo.completed}
                            onChange={() => handleStatusToggle(todo)}
                            slotProps={{
                              input: {
                                'aria-label': `mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`,
                              },
                            }}
                          />
                          <Stack spacing={1} sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? 'text.secondary' : 'text.primary',
                              }}
                            >
                              {todo.title}
                            </Typography>
                            {todo.description ? (
                              <Typography color="text.secondary">{todo.description}</Typography>
                            ) : null}
                            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                              <Chip
                                label={todo.completed ? 'Completed' : 'Active'}
                                color={todo.completed ? 'success' : 'primary'}
                                size="small"
                                variant={todo.completed ? 'filled' : 'outlined'}
                              />
                              <Chip
                                label={formatDueDate(todo.dueDate)}
                                color={overdue ? 'error' : 'default'}
                                size="small"
                                variant={overdue ? 'filled' : 'outlined'}
                              />
                              {overdue ? <Chip label="Overdue" color="warning" size="small" /> : null}
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1.5 }}>
                      <Button
                        type="button"
                        aria-label={`edit ${todo.title}`}
                        onClick={() => openEditDialog(todo)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        color="error"
                        aria-label={`delete ${todo.title}`}
                        onClick={() => handleDelete(todo)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                );
              })}
            </Stack>
          ) : null}
        </Stack>
      </Container>

      <Dialog open={Boolean(editingTodo)} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Task title"
              name="title"
              value={editValues.title}
              onChange={handleEditChange}
              required
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={editValues.description}
              onChange={handleEditChange}
              multiline
              minRows={3}
              fullWidth
            />
            <TextField
              label="Due date"
              name="dueDate"
              type="date"
              value={editValues.dueDate}
              onChange={handleEditChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            {editError ? <Alert severity="error">{editError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={submitting}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;