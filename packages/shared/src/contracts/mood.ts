import { z } from 'zod';
import { plannerDateSchema } from './planner.js';

export const moodValueTokens = ['AMAZING', 'HAPPY', 'NORMAL', 'SAD', 'TIRED'] as const;
export const moodValueSchema = z.enum(moodValueTokens);

export const moodUpsertSchema = z.object({
  mood: moodValueSchema,
  note: z.string().trim().max(200, 'Note must not exceed 200 characters').nullable().optional(),
}).strict();

export const moodHistoryQuerySchema = z.object({
  from: plannerDateSchema.optional(),
  to: plannerDateSchema.optional(),
}).strict();

export type MoodUpsertRequest = z.infer<typeof moodUpsertSchema>;
export type MoodHistoryQueryRequest = z.infer<typeof moodHistoryQuerySchema>;

export interface MoodResponse {
  id: string;
  userId: string;
  entryDate: string; // ISO string in UTC midnight
  mood: typeof moodValueTokens[number];
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
