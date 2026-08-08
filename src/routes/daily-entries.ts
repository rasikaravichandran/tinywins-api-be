import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { dailyEntrySchema, dateSchema } from '../schemas/daily-entry.js';

const includeRelations = { meals: true, goals: true } as const;

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export async function dailyEntryRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/daily-entries', async () => {
    return prisma.dailyEntry.findMany({
      include: includeRelations,
      orderBy: { date: 'desc' },
    });
  });

  app.get<{ Params: { date: string } }>('/api/v1/daily-entries/:date', async (request, reply) => {
    const result = dateSchema.safeParse(request.params.date);
    if (!result.success) {
      return reply.code(400).send({ error: 'Invalid date', details: result.error.flatten() });
    }

    const entry = await prisma.dailyEntry.findUnique({
      where: { date: parseDate(result.data) },
      include: includeRelations,
    });

    if (!entry) {
      return reply.code(404).send({ error: 'Daily entry not found' });
    }

    return entry;
  });

  app.post('/api/v1/daily-entries', async (request, reply) => {
    const result = dailyEntrySchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ error: 'Invalid daily entry', details: result.error.flatten() });
    }

    const { date, meals, goals, ...metrics } = result.data;
    const entry = await prisma.dailyEntry.upsert({
      where: { date: parseDate(date) },
      update: {
        ...metrics,
        meals: { deleteMany: {}, create: meals },
        goals: { deleteMany: {}, create: goals },
      },
      create: {
        date: parseDate(date),
        ...metrics,
        meals: { create: meals },
        goals: { create: goals },
      },
      include: includeRelations,
    });

    return reply.code(201).send(entry);
  });

  app.delete<{ Params: { date: string } }>('/api/v1/daily-entries/:date', async (request, reply) => {
    const result = dateSchema.safeParse(request.params.date);
    if (!result.success) {
      return reply.code(400).send({ error: 'Invalid date', details: result.error.flatten() });
    }

    const existing = await prisma.dailyEntry.findUnique({ where: { date: parseDate(result.data) } });
    if (!existing) {
      return reply.code(404).send({ error: 'Daily entry not found' });
    }

    await prisma.dailyEntry.delete({ where: { id: existing.id } });
    return reply.code(204).send();
  });
}
