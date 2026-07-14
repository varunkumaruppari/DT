import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { journalCreateSchema, journalUpdateSchema, journalHistoryQuerySchema } from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import {
  getJournalToday,
  getJournalHistory,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from '../../services/journal.service.js';

const journalRouter = Router();

// ============================================================
// GET /api/v1/journal/today — Get today's journal entry
// ============================================================
journalRouter.get('/today', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const journal = await getJournalToday(userId);
    sendSuccess(res, { journal }, 'Today\'s journal entry retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/v1/journal — Get journal history (filters only)
// ============================================================
journalRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedQuery = journalHistoryQuerySchema.parse(req.query);
    const journals = await getJournalHistory(userId, validatedQuery);
    sendSuccess(res, { journals }, 'Journal history retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/journal — Create a daily journal entry
// ============================================================
journalRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedBody = journalCreateSchema.parse(req.body);
    const journal = await createJournalEntry(userId, validatedBody);
    sendSuccess(res, { journal }, 'Journal entry created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/v1/journal/:id — Update a journal entry
// ============================================================
journalRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid journal ID format').parse(req.params.id);
    const validatedBody = journalUpdateSchema.parse(req.body);
    const journal = await updateJournalEntry(userId, id, validatedBody);
    sendSuccess(res, { journal }, 'Journal entry updated successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/v1/journal/:id — Soft delete a journal entry
// ============================================================
journalRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid journal ID format').parse(req.params.id);
    await deleteJournalEntry(userId, id);
    sendSuccess(res, null, 'Journal entry deleted successfully', 204);
  } catch (err) {
    next(err);
  }
});

export { journalRouter };
