import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Tiny Wins API', () => {
  it('returns a health response', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', service: 'tiny-wins-api' });
    await app.close();
  });

  it('rejects an invalid daily entry before database access', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/daily-entries',
      payload: { date: 'not-a-date', waterMl: -1 },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('Invalid daily entry');
    await app.close();
  });
});
