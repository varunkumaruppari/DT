import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { resolveWallClockToUtc } from '../lib/timezone.js';
import { deriveProgress } from './planners.service.js';
import type { TaskCreateRequest, TaskUpdateRequest, TaskReorderRequest } from '@ddt/shared';

export async function createTask(userId: string, data: TaskCreateRequest) {
  // 1. Verify planner ownership
  const planner = await prisma.planner.findUnique({
    where: { id: data.plannerId },
  });

  if (!planner || planner.deletedAt !== null) {
    throw new AppError('Planner not found', 'PLANNER_NOT_FOUND', 404);
  }

  if (planner.userId !== userId) {
    throw new AppError('You do not own this planner', 'FORBIDDEN', 403);
  }

  // 2. Verify category ownership if supplied
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

  // 3. Resolve scheduledTime to scheduledAt UTC instant
  let scheduledAt: Date | null = null;
  if (data.scheduledTime) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    const timezone = settings?.timezone || 'UTC';
    const dateStr = planner.plannerDate.toISOString().split('T')[0]!;
    scheduledAt = resolveWallClockToUtc(dateStr, data.scheduledTime, timezone);
  }

  // 4. Determine task position (end of list)
  const taskCount = await prisma.task.count({
    where: {
      plannerId: data.plannerId,
      deletedAt: null,
    },
  });

  // 5. Create task
  return prisma.task.create({
    data: {
      plannerId: data.plannerId,
      userId,
      categoryId: data.categoryId || null,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      scheduledAt,
      priority: data.priority || 'MEDIUM',
      position: taskCount,
      status: 'PLANNED',
    },
    include: {
      completion: true,
      category: true,
    },
  });
}

export async function getTask(userId: string, id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      completion: true,
      category: true,
    },
  });

  if (!task || task.deletedAt !== null) {
    throw new AppError('Task not found', 'TASK_NOT_FOUND', 404);
  }

  if (task.userId !== userId) {
    throw new AppError('You do not own this task', 'FORBIDDEN', 403);
  }

  return task;
}

export async function updateTask(userId: string, id: string, data: TaskUpdateRequest) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      planner: true,
    },
  });

  if (!task || task.deletedAt !== null) {
    throw new AppError('Task not found', 'TASK_NOT_FOUND', 404);
  }

  if (task.userId !== userId) {
    throw new AppError('You do not own this task', 'FORBIDDEN', 403);
  }

  const updateData: {
    title?: string;
    description?: string | null;
    categoryId?: string | null;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    status?: 'PLANNED' | 'SKIPPED' | 'CANCELLED';
    scheduledAt?: Date | null;
  } = {};

  if (data.title !== undefined) {
    updateData.title = data.title.trim();
  }

  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || null;
  }

  if (data.categoryId !== undefined) {
    if (data.categoryId !== null) {
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
    updateData.categoryId = data.categoryId;
  }

  if (data.priority !== undefined) {
    updateData.priority = data.priority;
  }

  if (data.status !== undefined) {
    // If status is being updated directly, let's make sure it doesn't violate rules
    const completion = await prisma.taskCompletion.findUnique({
      where: { taskId: id },
    });

    if (completion && (data.status === 'SKIPPED' || data.status === 'CANCELLED')) {
      throw new AppError('Cannot change status of a completed task', 'INVALID_TASK_TRANSITION', 409);
    }

    updateData.status = data.status;
  }

  if (data.scheduledTime !== undefined) {
    if (data.scheduledTime === null) {
      updateData.scheduledAt = null;
    } else {
      const settings = await prisma.userSettings.findUnique({
        where: { userId },
      });
      const timezone = settings?.timezone || 'UTC';
      const dateStr = task.planner.plannerDate.toISOString().split('T')[0]!;
      updateData.scheduledAt = resolveWallClockToUtc(dateStr, data.scheduledTime, timezone);
    }
  }

  return prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      completion: true,
      category: true,
    },
  });
}

export async function deleteTask(userId: string, id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt !== null) {
    throw new AppError('Task not found', 'TASK_NOT_FOUND', 404);
  }

  if (task.userId !== userId) {
    throw new AppError('You do not own this task', 'FORBIDDEN', 403);
  }

  // Soft delete task only
  return prisma.task.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function completeTask(userId: string, id: string, completionMethod?: 'APP' | 'NOTIFICATION' | 'SYSTEM') {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      completion: true,
    },
  });

  if (!task || task.deletedAt !== null) {
    throw new AppError('Task not found', 'TASK_NOT_FOUND', 404);
  }

  if (task.userId !== userId) {
    throw new AppError('You do not own this task', 'FORBIDDEN', 403);
  }

  // Verify transition states
  if (task.status === 'SKIPPED' || task.status === 'CANCELLED') {
    throw new AppError('Cannot complete a skipped or cancelled task', 'INVALID_TASK_TRANSITION', 409);
  }

  let taskCompletion = task.completion;

  if (!taskCompletion) {
    try {
      taskCompletion = await prisma.taskCompletion.create({
        data: {
          taskId: id,
          userId,
          completionMethod: completionMethod || 'APP',
        },
      });
    } catch (err) {
      // Handle unique constraint race
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
        const reRead = await prisma.taskCompletion.findUnique({
          where: { taskId: id },
        });
        if (reRead) {
          taskCompletion = reRead;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  // Calculate progress for the planner
  const tasks = await prisma.task.findMany({
    where: {
      plannerId: task.plannerId,
      deletedAt: null,
    },
    include: {
      completion: true,
    },
  });

  const progress = deriveProgress(tasks);

  return {
    taskCompletion,
    progress,
  };
}

export async function skipTask(userId: string, id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      completion: true,
    },
  });

  if (!task || task.deletedAt !== null) {
    throw new AppError('Task not found', 'TASK_NOT_FOUND', 404);
  }

  if (task.userId !== userId) {
    throw new AppError('You do not own this task', 'FORBIDDEN', 403);
  }

  if (task.completion) {
    throw new AppError('Cannot skip a completed task', 'INVALID_TASK_TRANSITION', 409);
  }

  if (task.status === 'CANCELLED') {
    throw new AppError('Cannot skip a cancelled task', 'INVALID_TASK_TRANSITION', 409);
  }

  if (task.status === 'SKIPPED') {
    // Idempotent retry: return task as is
    return task;
  }

  return prisma.task.update({
    where: { id },
    data: {
      status: 'SKIPPED',
    },
    include: {
      completion: true,
      category: true,
    },
  });
}

export async function reorderTasks(userId: string, data: TaskReorderRequest) {
  // 1. Verify planner ownership
  const planner = await prisma.planner.findUnique({
    where: { id: data.plannerId },
  });

  if (!planner || planner.deletedAt !== null) {
    throw new AppError('Planner not found', 'PLANNER_NOT_FOUND', 404);
  }

  if (planner.userId !== userId) {
    throw new AppError('You do not own this planner', 'FORBIDDEN', 403);
  }

  // 2. Load all active tasks for the planner
  const activeTasks = await prisma.task.findMany({
    where: {
      plannerId: data.plannerId,
      deletedAt: null,
    },
  });

  const N = activeTasks.length;
  const activeTaskIds = new Set(activeTasks.map((t) => t.id));

  // 3. Validation: complete list and structural checks
  const reqTaskIds = new Set<string>();
  const reqPositions = new Set<number>();

  for (const item of data.tasks) {
    // Check if task exists and belongs to this planner
    if (!activeTaskIds.has(item.taskId)) {
      // Check if it belongs to another user
      const dbTask = await prisma.task.findUnique({ where: { id: item.taskId } });
      if (dbTask && dbTask.userId !== userId) {
        throw new AppError('Access denied to task', 'FORBIDDEN', 403);
      }
      throw new AppError(`Task ${item.taskId} does not belong to this planner or is inactive`, 'VALIDATION_ERROR', 400);
    }

    if (reqTaskIds.has(item.taskId)) {
      throw new AppError(`Duplicate task ID in reorder list: ${item.taskId}`, 'VALIDATION_ERROR', 400);
    }
    reqTaskIds.add(item.taskId);

    if (reqPositions.has(item.position)) {
      throw new AppError(`Duplicate position in reorder list: ${item.position}`, 'VALIDATION_ERROR', 400);
    }
    reqPositions.add(item.position);

    if (item.position < 0 || item.position >= N) {
      throw new AppError(`Position ${item.position} is out of bounds (must be 0 to ${N - 1})`, 'VALIDATION_ERROR', 400);
    }
  }

  // Check if every active task is present in the request
  if (reqTaskIds.size !== N) {
    throw new AppError('Reorder request must include all active tasks for the planner', 'VALIDATION_ERROR', 400);
  }

  // 4. Update all positions inside a single transaction
  await prisma.$transaction(
    data.tasks.map((t) =>
      prisma.task.update({
        where: { id: t.taskId },
        data: { position: t.position },
      })
    )
  );

  // Return the newly ordered tasks
  return prisma.task.findMany({
    where: {
      plannerId: data.plannerId,
      deletedAt: null,
    },
    orderBy: {
      position: 'asc',
    },
    include: {
      completion: true,
      category: true,
    },
  });
}
