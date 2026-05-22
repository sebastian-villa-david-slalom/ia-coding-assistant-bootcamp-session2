process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app, db } = require('../../src/app');

beforeEach(() => {
  db.prepare('DELETE FROM todos').run();
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('TODO API integration', () => {
  it('creates, updates, toggles, lists, and deletes a task', async () => {
    const createResponse = await request(app)
      .post('/api/todos')
      .send({
        title: 'Prepare release notes',
        description: 'Include feature highlights and migration notes',
        dueDate: '2026-06-30',
      })
      .set('Accept', 'application/json');

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      title: 'Prepare release notes',
      completed: false,
    });

    const todoId = createResponse.body.id;

    const updateResponse = await request(app)
      .put(`/api/todos/${todoId}`)
      .send({
        title: 'Prepare release notes v2',
        description: 'Include rollout timeline',
        dueDate: '2026-07-01',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: todoId,
      title: 'Prepare release notes v2',
      description: 'Include rollout timeline',
      dueDate: '2026-07-01',
      completed: false,
    });

    const statusResponse = await request(app)
      .patch(`/api/todos/${todoId}/status`)
      .send({ completed: true });

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body).toMatchObject({
      id: todoId,
      completed: true,
    });

    const listResponse = await request(app).get('/api/todos');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      id: todoId,
      title: 'Prepare release notes v2',
      completed: true,
    });

    const deleteResponse = await request(app).delete(`/api/todos/${todoId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      message: 'Task deleted successfully',
      id: todoId,
    });

    const missingResponse = await request(app).get('/api/todos');
    expect(missingResponse.status).toBe(200);
    expect(missingResponse.body).toHaveLength(0);
  });
});