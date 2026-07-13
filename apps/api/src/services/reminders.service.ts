import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ReminderSchedule } from '@prisma/client';
import type { ReminderResponse } from '@ddt/shared';

function mapReminder(reminder: ReminderSchedule): ReminderResponse {
  return {
    id: reminder.id,
    taskId: reminder.taskId,
    userId: reminder.userId,
    scheduledFor: reminder.scheduledFor.toISOString(),
    status: reminder.status,
    reminderMinutes: reminder.reminderMinutes,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString(),
  };
}

export async function getReminders(userId: string): Promise<ReminderResponse[]> {
  const reminders = await prisma.reminderSchedule.findMany({
    where: {
      userId,
    },
    orderBy: {
      scheduledFor: 'asc',
    },
  });

  return reminders.map(mapReminder);
}

export async function snoozeReminder(
  userId: string,
  id: string,
  minutes: number
): Promise<ReminderResponse> {
  return prisma.$transaction(async (tx) => {
    const reminder = await tx.reminderSchedule.findUnique({
      where: { id },
    });

    if (!reminder) {
      throw new AppError('Reminder not found', 'REMINDER_NOT_FOUND', 404);
    }

    if (reminder.userId !== userId) {
      throw new AppError('You do not own this reminder', 'FORBIDDEN', 403);
    }

    if (reminder.status === 'COMPLETED' || reminder.status === 'CANCELLED') {
      throw new AppError('Cannot snooze completed or cancelled reminders', 'INVALID_REMINDER_TRANSITION', 409);
    }

    const newScheduledFor = new Date(Date.now() + minutes * 60 * 1000);

    const updatedReminder = await tx.reminderSchedule.update({
      where: { id },
      data: {
        scheduledFor: newScheduledFor,
        status: 'SCHEDULED',
      },
    });

    // Cancel existing PENDING queue rows
    await tx.notificationQueue.updateMany({
      where: {
        reminderScheduleId: id,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // Create a new PENDING queue row
    await tx.notificationQueue.create({
      data: {
        reminderScheduleId: id,
        userId,
        status: 'PENDING',
        availableAt: newScheduledFor,
      },
    });

    return mapReminder(updatedReminder);
  });
}

export async function cancelReminder(userId: string, id: string): Promise<ReminderResponse> {
  return prisma.$transaction(async (tx) => {
    const reminder = await tx.reminderSchedule.findUnique({
      where: { id },
    });

    if (!reminder) {
      throw new AppError('Reminder not found', 'REMINDER_NOT_FOUND', 404);
    }

    if (reminder.userId !== userId) {
      throw new AppError('You do not own this reminder', 'FORBIDDEN', 403);
    }

    if (reminder.status === 'CANCELLED') {
      return mapReminder(reminder);
    }

    if (reminder.status === 'COMPLETED') {
      throw new AppError('Cannot cancel completed reminders', 'INVALID_REMINDER_TRANSITION', 409);
    }

    const updatedReminder = await tx.reminderSchedule.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    // Cancel all PENDING queue rows
    await tx.notificationQueue.updateMany({
      where: {
        reminderScheduleId: id,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return mapReminder(updatedReminder);
  });
}
