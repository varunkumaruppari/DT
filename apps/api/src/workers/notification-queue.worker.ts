import webpush from 'web-push';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { generateActionToken } from '../services/notifications.service.js';

// Initialize web-push details
webpush.setVapidDetails(
  env.VAPID_SUBJECT,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

let queueInterval: NodeJS.Timeout | null = null;
let isProcessingQueue = false;
const workerId = `worker-${process.pid}`;

export async function processNotificationQueue(): Promise<void> {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    // 1. Transactionally claim pending items using FOR UPDATE SKIP LOCKED
    const claimedItems = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Select matching IDs
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "NotificationQueue"
        WHERE
          (status = 'PENDING'::"QueueStatus" AND "availableAt" <= ${now})
          OR (status = 'PROCESSING'::"QueueStatus" AND "lockedAt" <= ${fiveMinutesAgo})
        ORDER BY "availableAt" ASC, "createdAt" ASC
        LIMIT 25
        FOR UPDATE SKIP LOCKED
      `;

      if (locked.length === 0) {
        return [];
      }

      const ids = locked.map((item) => item.id);

      // Update status to PROCESSING and set locks
      await tx.notificationQueue.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'PROCESSING',
          lockedAt: now,
          lockedBy: workerId,
          attemptCount: { increment: 1 },
        },
      });

      // Retrieve full claimed queue records
      return tx.notificationQueue.findMany({
        where: { id: { in: ids } },
      });
    });

    if (claimedItems.length === 0) {
      isProcessingQueue = false;
      return;
    }

    // 2. Process each item outside transaction
    for (const queueItem of claimedItems) {
      try {
        const reminder = await prisma.reminderSchedule.findUnique({
          where: { id: queueItem.reminderScheduleId },
          include: { task: true },
        });

        if (!reminder || !reminder.task || reminder.status === 'CANCELLED') {
          // If task or reminder is gone or cancelled, mark queueItem as CANCELLED/FAILED
          await prisma.notificationQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'CANCELLED',
              processedAt: new Date(),
              lastError: 'Associated task, reminder was deleted or cancelled',
            },
          });
          continue;
        }

        // Fetch active push subscriptions for user
        const subscriptions = await prisma.pushSubscription.findMany({
          where: {
            userId: queueItem.userId,
            isActive: true,
          },
        });

        if (subscriptions.length === 0) {
          // No active subscriptions, mark as failed (retryable if subscriptions might be added, or terminal FAILED)
          throw new Error('No active push subscriptions registered for this user');
        }

        // Generate action tokens
        const completeToken = generateActionToken(queueItem.userId, 'complete', { taskId: reminder.taskId });
        const snoozeToken = generateActionToken(queueItem.userId, 'snooze', { reminderId: reminder.id });
        const dismissToken = generateActionToken(queueItem.userId, 'dismiss', { reminderId: reminder.id });

        const payload = JSON.stringify({
          title: 'Task Reminder',
          body: `It's time to start: "${reminder.task.title}"`,
          tag: `task-reminder-${reminder.task.id}`,
          data: {
            taskId: reminder.taskId,
            reminderId: reminder.id,
            actions: {
              complete: {
                url: '/api/v1/notifications/actions/complete',
                token: completeToken,
              },
              snooze: {
                url: '/api/v1/notifications/actions/snooze',
                token: snoozeToken,
              },
              dismiss: {
                url: '/api/v1/notifications/actions/dismiss',
                token: dismissToken,
              },
            },
          },
        });

        let successCount = 0;
        let lastErrorMsg = '';

        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            );

            // Update subscription last used
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { lastUsedAt: new Date() },
            });

            successCount++;
          } catch (err: unknown) {
            const error = err as { message?: string; statusCode?: number };
            lastErrorMsg = error.message || 'Push service delivery error';

            // Check if sub should be deactivated (non-retryable 404/410)
            if (error.statusCode === 404 || error.statusCode === 410) {
              await prisma.pushSubscription.update({
                where: { id: sub.id },
                data: { isActive: false },
              });
            }
          }
        }

        if (successCount > 0) {
          // Success: Mark SENT
          await prisma.notificationQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'SENT',
              processedAt: new Date(),
            },
          });

          // Update reminder status
          await prisma.reminderSchedule.update({
            where: { id: reminder.id },
            data: { status: 'COMPLETED' },
          });

          // Log the successful notification delivery
          await prisma.notification.create({
            data: {
              notificationQueueId: queueItem.id,
              userId: queueItem.userId,
              type: 'TASK_REMINDER',
              title: 'Task Reminder',
              body: `It's time to start: "${reminder.task.title}"`,
              deliveryStatus: 'SENT',
              sentAt: new Date(),
              deliveredAt: new Date(),
            },
          });
        } else {
          // No subscriptions succeeded
          throw new Error(lastErrorMsg || 'All push notification requests failed');
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        const errorMsg = error.message || 'Unknown processing error';

        if (queueItem.attemptCount < queueItem.maxAttempts) {
          const backoffSeconds = queueItem.attemptCount === 1 ? 30 : 120;
          await prisma.notificationQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'PENDING',
              availableAt: new Date(Date.now() + backoffSeconds * 1000),
              lastError: errorMsg,
            },
          });
        } else {
          // Max attempts reached -> Mark FAILED
          await prisma.notificationQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'FAILED',
              processedAt: new Date(),
              lastError: errorMsg,
            },
          });

          const reminder = await prisma.reminderSchedule.findUnique({
            where: { id: queueItem.reminderScheduleId },
            include: { task: true },
          });

          await prisma.notification.create({
            data: {
              notificationQueueId: queueItem.id,
              userId: queueItem.userId,
              type: 'TASK_REMINDER',
              title: 'Task Reminder',
              body: reminder?.task ? `It's time to start: "${reminder.task.title}"` : 'Task Reminder',
              deliveryStatus: 'FAILED',
              failedAt: new Date(),
              failureReason: errorMsg,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error('❌ Error processing notification queue:', err);
  } finally {
    isProcessingQueue = false;
  }
}

export function startNotificationQueueWorker(): void {
  // Poll every 15 seconds
  processNotificationQueue().catch(console.error);
  queueInterval = setInterval(() => {
    processNotificationQueue().catch(console.error);
  }, 15 * 1000);
}

export function stopNotificationQueueWorker(): void {
  if (queueInterval) {
    clearInterval(queueInterval);
    queueInterval = null;
  }
}
