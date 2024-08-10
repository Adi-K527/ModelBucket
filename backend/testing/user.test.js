import request from "supertest";
import { app } from "../server.js";

describe('POST /api/user/register', () => {
    it('should create a new user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        name: 'Test User'
      };
      const res = await request(app).post('/api/user/register').send(newUser);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });
  });