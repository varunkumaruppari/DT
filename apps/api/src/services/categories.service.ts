import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CategoryCreateRequest, CategoryUpdateRequest } from '@ddt/shared';

export async function getCategories(userId: string) {
  return prisma.category.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function createCategory(userId: string, data: CategoryCreateRequest) {
  const nameTrimmed = data.name.trim();

  // Validate case-insensitive uniqueness among active categories for this user
  const duplicate = await prisma.category.findFirst({
    where: {
      userId,
      deletedAt: null,
      name: {
        equals: nameTrimmed,
        mode: 'insensitive',
      },
    },
  });

  if (duplicate) {
    throw new AppError(`Category "${nameTrimmed}" already exists`, 'CATEGORY_ALREADY_EXISTS', 409);
  }

  return prisma.category.create({
    data: {
      userId,
      name: nameTrimmed,
      color: data.color,
      icon: data.icon?.trim() || 'tag',
    },
  });
}

export async function updateCategory(userId: string, id: string, data: CategoryUpdateRequest) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError('Category not found', 'CATEGORY_NOT_FOUND', 404);
  }

  if (category.userId !== userId) {
    throw new AppError('You do not own this category', 'FORBIDDEN', 403);
  }

  const updateData: { name?: string; color?: string; icon?: string } = {};

  if (data.name !== undefined) {
    const nameTrimmed = data.name.trim();
    if (nameTrimmed.length < 1 || nameTrimmed.length > 50) {
      throw new AppError('Category name must be between 1 and 50 characters', 'VALIDATION_ERROR', 400);
    }

    // Validate uniqueness against OTHER active categories
    const duplicate = await prisma.category.findFirst({
      where: {
        userId,
        deletedAt: null,
        id: { not: id },
        name: {
          equals: nameTrimmed,
          mode: 'insensitive',
        },
      },
    });

    if (duplicate) {
      throw new AppError(`Category "${nameTrimmed}" already exists`, 'CATEGORY_ALREADY_EXISTS', 409);
    }

    updateData.name = nameTrimmed;
  }

  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  if (data.icon !== undefined) {
    updateData.icon = data.icon.trim() || 'tag';
  }

  return prisma.category.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteCategory(userId: string, id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError('Category not found', 'CATEGORY_NOT_FOUND', 404);
  }

  if (category.userId !== userId) {
    throw new AppError('You do not own this category', 'FORBIDDEN', 403);
  }

  // Soft delete category only (set deletedAt).
  // Do NOT update tasks' categoryId or delete tasks.
  return prisma.category.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
