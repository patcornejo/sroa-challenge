import request from 'supertest';
import express from 'express';
import routes from '../../routes';

import * as auth from '../../controllers/auth.controller';
import * as redis from '../../lib/redis';
jest.mock('@sendgrid/mail');

const app = express();
app.use(express.json());
routes(app);

describe('POST /login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a token on successful login', async () => {
    const mockToken = 'mockToken';
    const mock = jest.spyOn(auth, "login").mockReturnValue(Promise.resolve(mockToken));

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password123', client: 'web' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, token: mockToken });
    expect(mock).toHaveBeenCalledWith('test@example.com', 'password123', 'web');
  });

  it('should block account and send reset password link after 3 failed attempts', async () => {
    const mockGetAttempt = jest.spyOn(redis, "getAttempt").mockReturnValue(Promise.resolve(3));
    const mockForgotPassword = jest.spyOn(auth, "forgotPassword").mockReturnValue(Promise.resolve({ success: true }));
    const mockLogin = jest.spyOn(auth, "login").mockReturnValue(Promise.resolve(null));

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'blocked@example.com', password: 'wrongpassword', client: 'web' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Your account was blocked. A link to reset password was sent to the email',
    });
    expect(mockGetAttempt).toHaveBeenCalledWith('blocked@example.com');
    expect(mockForgotPassword).toHaveBeenCalledWith('blocked@example.com');
  });
});