process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app, db } = require('../src/app');

beforeEach(() => {
  db.prepare('DELETE FROM todos').run();
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

const createTodo = async (overrides = {}) => {
  const response = await request(app)
    .post('/api/todos')
    .send({
      title: 'Temp Task',
      description: 'Temporary description',
      dueDate: '2026-06-15',
      ...overrides,
    })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('TODO API Endpoints', () => {
  describe('GET /api/todos', () => {
    it('should return todos sorted by status, due date, and creation order', async () => {
      await createTodo({ title: 'Later due', dueDate: '2026-07-01' });
      const soonerTodo = await createTodo({ title: 'Sooner due', dueDate: '2026-06-01' });
      const noDueDateTodo = await createTodo({ title: 'No due date', dueDate: null });

      await request(app)
        .patch(`/api/todos/${noDueDateTodo.id}/status`)
        .send({ completed: true });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body.map((todo) => todo.title)).toEqual([
        'Sooner due',
        'Later due',
        'No due date',
      ]);
      expect(response.body[0]).toMatchObject({
        id: soonerTodo.id,
        title: 'Sooner due',
        description: 'Temporary description',
        dueDate: '2026-06-01',
        completed: false,
      });
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Write documentation',
          description: 'Capture the implementation details',
          dueDate: '2026-06-20',
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'Write documentation',
        description: 'Capture the implementation details',
        dueDate: '2026-06-20',
        completed: false,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Task title is required' });
    });

    it('should return 400 if due date is invalid', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Broken due date', dueDate: 'not-a-date' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Task due date must be a valid date if provided' });
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update an existing task without creating a duplicate', async () => {
      const todo = await createTodo({ title: 'Original title', dueDate: '2026-06-10' });

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({
          title: 'Updated title',
          description: 'Updated description',
          dueDate: '2026-06-12',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: todo.id,
        title: 'Updated title',
        description: 'Updated description',
        dueDate: '2026-06-12',
        completed: false,
      });

      const listResponse = await request(app).get('/api/todos');
      expect(listResponse.body).toHaveLength(1);
    });
  });

  describe('PATCH /api/todos/:id/status', () => {
    it('should mark a task as completed and incomplete', async () => {
      const todo = await createTodo({ title: 'Toggle me' });

      const completeResponse = await request(app)
        .patch(`/api/todos/${todo.id}/status`)
        .send({ completed: true });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body).toMatchObject({ id: todo.id, completed: true });

      const reopenResponse = await request(app)
        .patch(`/api/todos/${todo.id}/status`)
        .send({ completed: false });

      expect(reopenResponse.status).toBe(200);
      expect(reopenResponse.body).toMatchObject({ id: todo.id, completed: false });
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing task', async () => {
      const todo = await createTodo({ title: 'Delete me' });

      const deleteResponse = await request(app).delete(`/api/todos/${todo.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: todo.id });

      const deleteAgain = await request(app).delete(`/api/todos/${todo.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toEqual({ error: 'Task not found' });
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/todos/abc');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Valid task ID is required' });
    });
  });
});