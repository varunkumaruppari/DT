import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { RecurringTask, Prisma } from '@prisma/client';
import type {
  RecurringTaskCreateRequest,
  RecurringTaskUpdateRequest,
  RecurringTaskResponse,
} from '@ddt/shared';

function mapRecurringTask(task: RecurringTask): RecurringTaskResponse {
  return {
    id: task.id,
    userId: task.userId,
    categoryId: task.categoryId,
    title: task.title,
    description: task.description,
    scheduledLocalTime: task.scheduledLocalTime,
    priority: task.priority,
    recurrenceType: task.recurrenceType,
    recurrenceConfig: task.recurrenceConfig as Record<string, unknown>,
    reminderEnabled: task.reminderEnabled,
    reminderMinutes: task.reminderMinutes,
    startsOn: task.startsOn.toISOString().split('T')[0]!,
    endsOn: task.endsOn ? task.endsOn.toISOString().split('T')[0]! : null,
    isActive: task.isActive,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    deletedAt: task.deletedAt ? task.deletedAt.toISOString() : null,
  };
}

export async function createRecurringTask(
  userId: string,
  data: RecurringTaskCreateRequest
): Promise<RecurringTaskResponse> {
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category || category.deletedAt !== null) {
      throw new AppError('Category not found', 'CATEGORY_NOT_FOUND', 404);
    }
    if (category.userId !== userId) {
      throw new AppError('You do not own this category', 'FORBIDDEN', 403);
    }
  }

  const startsOn = new Date(data.startsOn + 'T00:00:00Z');
  const endsOn = data.endsOn ? new Date(data.endsOn + 'T00:00:00Z') : null;

  const task = await prisma.recurringTask.create({
    data: {
      userId,
      categoryId: data.categoryId || null,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      scheduledLocalTime: data.scheduledLocalTime,
      priority: data.priority || 'MEDIUM',
      recurrenceType: data.recurrenceType,
      recurrenceConfig: data.recurrenceConfig as Prisma.InputJsonValue,
      reminderEnabled: data.reminderEnabled !== undefined ? data.reminderEnabled : true,
      reminderMinutes: data.reminderMinutes || null,
      startsOn,
      endsOn,
      isActive: true,
    },
  });

  return mapRecurringTask(task);
}

export async function getRecurringTasks(userId: string): Promise<RecurringTaskResponse[]> {
  const tasks = await prisma.recurringTask.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return tasks.map(mapRecurringTask);
}

export async function getRecurringTask(userId: string, id: string): Promise<RecurringTaskResponse> {
  const task = await prisma.recurringTask.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt !== null) {
    throw new AppError('Recurring task not found', 'RECURRING_TASK_NOT_FOUND', 404);
  }

  if (task.userId !== userId) {
    throw new AppError('You do not own this recurring task', 'FORBIDDEN', 403);
  }

  return mapRecurringTask(task);
}

export async function updateRecurringTask(
  userId: string,
  id: string,
  data: RecurringTaskUpdateRequest
): Promise<RecurringTaskResponse> {
  const task = await prisma.recurringTask.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt !== null) {
    throw new AppError('Recurring task not found', 'RECURRING_TASK_NOT_FOUND', 404);
  }

  if (task.userId !== userId) {
    throw new AppError('You do not own this recurring task', 'FORBIDDEN', 403);
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category || category.deletedAt !== null) {
      throw new AppError('Category not found', 'CATEGORY_NOT_FOUND', 404);
    }
    if (category.userId !== userId) {
      throw new AppError('You do not own this category', 'FORBIDDEN', 403);
    }
  }

  const updateData: Prisma.RecurringTaskUncheckedUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.scheduledLocalTime !== undefined) updateData.scheduledLocalTime = data.scheduledLocalTime;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.recurrenceType !== undefined) updateData.recurrenceType = data.recurrenceType;
  if (data.recurrenceConfig !== undefined) updateData.recurrenceConfig = data.recurrenceConfig as Prisma.InputJsonValue;
  if (data.reminderEnabled !== undefined) updateData.reminderEnabled = data.reminderEnabled;
  if (data.reminderMinutes !== undefined) updateData.reminderMinutes = data.reminderMinutes;
  if (data.startsOn !== undefined) updateData.startsOn = new Date(data.startsOn + 'T00:00:00Z');
  if (data.endsOn !== undefined) updateData.endsOn = data.endsOn ? new Date(data.endsOn + 'T00:00:00Z') : null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updated = await prisma.recurringTask.update({
    where: { id },
    data: updateData,
  });

  return mapRecurringTask(updated);
}

export async function deleteRecurringTask(userId: string, id: string): Promise<RecurringTaskResponse> {
  const task = await prisma.recurringTask.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt !== null) {
    throw new AppError('Recurring task not found', 'RECURRING_TASK_NOT_FOUND', 404);
  }

  if (task.userId !== userId) {
    throw new AppError('You do not own this recurring task', 'FORBIDDEN', 403);
  }

  const deleted = await prisma.recurringTask.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  return mapRecurringTask(deleted);
}
