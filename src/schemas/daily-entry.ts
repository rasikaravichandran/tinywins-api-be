import { z } from 'zod';

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format');

export const mealSchema = z.object({
  name: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(500).optional(),
});

export const goalSchema = z.object({
  goal: z.string().trim().min(1).max(200),
  completed: z.boolean().default(true),
});

export const dailyEntrySchema = z.object({
  date: dateSchema,
  waterMl: z.number().int().nonnegative().max(100_000).default(0),
  walkingKm: z.number().nonnegative().max(10_000).default(0),
  runningKm: z.number().nonnegative().max(10_000).default(0),
  meals: z.array(mealSchema).max(20).default([]),
  goals: z.array(goalSchema).max(50).default([]),
});

export type DailyEntryInput = z.infer<typeof dailyEntrySchema>;
