import { z } from 'zod';

export const categoryColorTokens = ['violet', 'cyan', 'emerald', 'rose', 'amber', 'sky'] as const;
export const categoryColorSchema = z.enum(categoryColorTokens);

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50, 'Category name must not exceed 50 characters'),
  color: categoryColorSchema,
  icon: z.string().trim().min(1, 'Icon name must not be empty').max(50, 'Icon name must not exceed 50 characters').optional(),
}).strict();

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50, 'Category name must not exceed 50 characters').optional(),
  color: categoryColorSchema.optional(),
  icon: z.string().trim().min(1, 'Icon name must not be empty').max(50, 'Icon name must not exceed 50 characters').optional(),
}).strict();

export type CategoryCreateRequest = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateRequest = z.infer<typeof categoryUpdateSchema>;

export interface CategoryResponse {
  id: string;
  userId: string;
  name: string;
  color: typeof categoryColorTokens[number];
  icon: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
