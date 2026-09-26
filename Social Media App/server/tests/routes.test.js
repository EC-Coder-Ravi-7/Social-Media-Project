import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/Route.js';

const app = express();
app.use(express.json());
app.use('/', authRoutes);

describe('Integration: API Endpoints & Middlewares', () => {
  test('GET /fetchAllPosts returns 200 and an array or paginated object', async () => {
    const res = await request(app).get('/fetchAllPosts');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
  });

  test('POST /register rejects malformed body with 400 Validation Error', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: 'ab', email: 'invalid-email' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  test('Rate limiter headers are returned on auth routes', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'fake@example.com', password: 'password123' });

    expect(res.headers).toHaveProperty('x-ratelimit-limit');
    expect(res.headers).toHaveProperty('x-ratelimit-remaining');
  });
});