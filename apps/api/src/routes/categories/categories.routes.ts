import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { categoryCreateSchema, categoryUpdateSchema } from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categories.service.js';

const categoriesRouter = Router();

// ============================================================
// GET /api/v1/categories — Get active user categories
// ============================================================
categoriesRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const categories = await getCategories(userId);
    sendSuccess(res, { categories }, 'Categories retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/categories — Create a category
// ============================================================
categoriesRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedBody = categoryCreateSchema.parse(req.body);
    const category = await createCategory(userId, validatedBody);
    sendSuccess(res, { category }, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/v1/categories/:id — Update a category
// ============================================================
categoriesRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid category ID format').parse(req.params.id);
    const validatedBody = categoryUpdateSchema.parse(req.body);
    const category = await updateCategory(userId, id, validatedBody);
    sendSuccess(res, { category }, 'Category updated successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/v1/categories/:id — Soft delete a category
// ============================================================
categoriesRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid category ID format').parse(req.params.id);
    await deleteCategory(userId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export { categoriesRouter };
