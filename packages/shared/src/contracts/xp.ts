import { z } from 'zod';

export const xpHistoryQuerySchema = z.object({
  cursor: z.string().uuid('Invalid cursor format').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
}).strict();

export type XpHistoryQueryRequest = z.infer<typeof xpHistoryQuerySchema>;

export interface XpSummaryResponse {
  totalXP: number;
  level: number;
  xpIntoCurrentLevel: number;
  xpRequiredForNextLevel: number;
  levelProgressPercentage: number;
}

export interface XpTransactionResponse {
  id: string;
  amount: number;
  reason: string;
  sourceType: string;
  sourceId: string;
  createdAt: string;
}

export interface XpHistoryResponse {
  items: XpTransactionResponse[];
  nextCursor: string | null;
}
