import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { dailyEntryRoutes } from './routes/daily-entries.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: env.CORS_ORIGIN });
  app.get('/health', async () => ({ status: 'ok', service: 'tiny-wins-api' }));
  app.register(dailyEntryRoutes);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    return reply.code(error.statusCode ?? 500).send({ error: 'Internal server error' });
  });

  return app;
}
