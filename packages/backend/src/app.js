const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const isTest = process.env.NODE_ENV === 'test';
const databasePath = process.env.DATABASE_PATH
  || (isTest ? ':memory:' : path.join(__dirname, '..', 'data', 'todos.db'));

if (databasePath !== ':memory:') {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

const db = new Database(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const selectTodoByIdStmt = db.prepare(`
  SELECT id, title, description, due_date, completed, created_at, updated_at
  FROM todos
  WHERE id = ?
`);

const selectTodosStmt = db.prepare(`
  SELECT id, title, description, due_date, completed, created_at, updated_at
  FROM todos
  ORDER BY completed ASC, due_date IS NULL ASC, due_date ASC, created_at ASC
`);

const createTodoStmt = db.prepare(`
  INSERT INTO todos (title, description, due_date)
  VALUES (@title, @description, @dueDate)
`);

const updateTodoStmt = db.prepare(`
  UPDATE todos
  SET title = @title,
      description = @description,
      due_date = @dueDate,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = @id
`);

const updateTodoStatusStmt = db.prepare(`
  UPDATE todos
  SET completed = @completed,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = @id
`);

const deleteTodoStmt = db.prepare('DELETE FROM todos WHERE id = ?');

function parseTodoId(idParam) {
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id)) {
    return null;
  }

  return id;
}

function normalizeDueDate(dueDate) {
  if (dueDate == null || dueDate === '') {
    return null;
  }

  if (typeof dueDate !== 'string') {
    return undefined;
  }

  const parsedDate = new Date(dueDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return dueDate;
}

function validateTodoPayload(payload) {
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const description = payload.description == null
    ? null
    : typeof payload.description === 'string'
      ? payload.description.trim() || null
      : undefined;
  const dueDate = normalizeDueDate(payload.dueDate);

  if (!title) {
    return { error: 'Task title is required' };
  }

  if (description === undefined) {
    return { error: 'Task description must be a string if provided' };
  }

  if (dueDate === undefined) {
    return { error: 'Task due date must be a valid date if provided' };
  }

  return {
    value: {
      title,
      description,
      dueDate,
    },
  };
}

function mapTodo(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function findTodo(id) {
  return mapTodo(selectTodoByIdStmt.get(id));
}

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/todos', (req, res) => {
  try {
    const todos = selectTodosStmt.all().map(mapTodo);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const validation = validateTodoPayload(req.body || {});

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const result = createTodoStmt.run(validation.value);
    const todo = findTodo(result.lastInsertRowid);

    return res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const id = parseTodoId(req.params.id);

    if (id == null) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    if (!findTodo(id)) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const validation = validateTodoPayload(req.body || {});

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    updateTodoStmt.run({ ...validation.value, id });
    return res.json(findTodo(id));
  } catch (error) {
    console.error('Error updating todo:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

app.patch('/api/todos/:id/status', (req, res) => {
  try {
    const id = parseTodoId(req.params.id);

    if (id == null) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    if (typeof req.body?.completed !== 'boolean') {
      return res.status(400).json({ error: 'Task completed status must be a boolean' });
    }

    if (!findTodo(id)) {
      return res.status(404).json({ error: 'Task not found' });
    }

    updateTodoStatusStmt.run({ id, completed: req.body.completed ? 1 : 0 });
    return res.json(findTodo(id));
  } catch (error) {
    console.error('Error updating todo status:', error);
    return res.status(500).json({ error: 'Failed to update task status' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = parseTodoId(req.params.id);

    if (id == null) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    if (!findTodo(id)) {
      return res.status(404).json({ error: 'Task not found' });
    }

    deleteTodoStmt.run(id);
    return res.json({ message: 'Task deleted successfully', id });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = {
  app,
  db,
  findTodo,
};