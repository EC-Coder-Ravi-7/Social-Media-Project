import { registerSchema, loginSchema } from '../validation/schemas.js';

describe('Unit: Input Validation Schemas', () => {
  test('registerSchema passes with valid credentials', () => {
    const validData = {
      username: 'ravi_shankar',
      email: 'ravi@example.com',
      password: 'strongpassword123',
    };
    expect(() => registerSchema.parse(validData)).not.toThrow();
  });

  test('registerSchema rejects invalid email format', () => {
    const invalidData = {
      username: 'ravi_shankar',
      email: 'not-an-email',
      password: 'password123',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow();
  });

  test('registerSchema rejects short passwords (< 6 chars)', () => {
    const invalidData = {
      username: 'ravi_shankar',
      email: 'test@example.com',
      password: '123',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow();
  });

  test('loginSchema requires both email and password', () => {
    const missingPassword = { email: 'test@example.com' };
    expect(() => loginSchema.parse(missingPassword)).toThrow();
  });
});