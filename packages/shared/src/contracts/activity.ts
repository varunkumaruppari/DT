import { z } from 'zod';

export const activityQuerySchema = z.object({
  cursor: z.string().uuid('Invalid cursor format').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  type: z.string().optional(),
}).strict();

export type ActivityQueryRequest = z.infer<typeof activityQuerySchema>;

export interface ActivityLogResponse {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  occurredAt: string;
}

export interface ActivityHistoryResponse {
  items: ActivityLogResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}
