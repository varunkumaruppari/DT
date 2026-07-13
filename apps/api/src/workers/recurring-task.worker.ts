import { prisma } from '../lib/prisma.js';
import { getCurrentCalendarDate, resolveRecurringWallClockToUtc } from '../lib/timezone.js';

let generationInterval: NodeJS.Timeout | null = null;
let isGenerating = false;

export async function runRecurringTaskGeneration(): Promise<void> {
  if (isGenerating) return;
  isGenerating = true;

  try {
    console.log('🔄 Running recurring task generation worker...');
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: { settings: true },
    });

    for (const user of users) {
      const settings = user.settings;
      if (!settings) continue;
      const timezone = settings.timezone;
      const todayStr = getCurrentCalendarDate(timezone);

      // Generate dates for horizon: today through today + 6 days
      const dates: string[] = [];
      const baseDate = new Date(`${todayStr}T12:00:00`); // use noon to avoid tz overflow
      for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
      }

      for (const dateStr of dates) {
        // Run generation in a transaction
        await prisma.$transaction(async (tx) => {
          const plannerDate = new Date(dateStr + 'T00:00:00Z');
          // Find or create planner
          let planner = await tx.planner.findUnique({
            where: {
              userId_plannerDate: {
                userId: user.id,
                plannerDate,
              },
            },
          });

          if (!planner) {
            planner = await tx.planner.create({
              data: {
                userId: user.id,
                plannerDate,
              },
            });
          }

          // Lock parent planner row using raw SQL
          await tx.$executeRaw`SELECT id FROM "Planner" WHERE id = ${planner.id}::uuid FOR UPDATE`;

          // Find generated templates
          const existingTasks = await tx.task.findMany({
            where: {
              plannerId: planner.id,
              recurringTaskId: { not: null },
              deletedAt: null,
            },
          });
          const generatedTemplateIds = new Set(existingTasks.map((t) => t.recurringTaskId));

          // Get active templates that start on or before this date
          const templates = await tx.recurringTask.findMany({
            where: {
              userId: user.id,
              isActive: true,
              deletedAt: null,
              startsOn: { lte: new Date(dateStr + 'T23:59:59.999Z') },
            },
          });

          for (const template of templates) {
            const startsOnStr = template.startsOn.toISOString().split('T')[0]!;
            const endsOnStr = template.endsOn ? template.endsOn.toISOString().split('T')[0]! : null;

            if (startsOnStr > dateStr || (endsOnStr && endsOnStr < dateStr)) {
              continue;
            }

            // Check recurrence rule
            let isMatch = false;
            if (template.recurrenceType === 'DAILY') {
              isMatch = true;
            } else if (template.recurrenceType === 'WEEKLY' || template.recurrenceType === 'CUSTOM') {
              const dateObj = new Date(`${dateStr}T12:00:00`);
              const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone });
              const weekday = formatter.format(dateObj).toUpperCase();
              const weekdays = (template.recurrenceConfig as { weekdays?: string[] })?.weekdays || [];
              isMatch = weekdays.includes(weekday);
            }

            if (isMatch && !generatedTemplateIds.has(template.id)) {
              const resolved = resolveRecurringWallClockToUtc(dateStr, template.scheduledLocalTime, timezone);
              if (resolved.status === 'NONEXISTENT') {
                console.warn(`[DST Warning] Skipping task generation due to nonexistent local time: userId=${user.id}, templateId=${template.id}, date=${dateStr}, time=${template.scheduledLocalTime}`, { reason: 'DST_NONEXISTENT_TIME' });
                continue;
              }

              if (resolved.status === 'SUCCESS' && resolved.utcDate) {
                const count = await tx.task.count({
                  where: { plannerId: planner.id, deletedAt: null },
                });

                const newTask = await tx.task.create({
                  data: {
                    plannerId: planner.id,
                    userId: user.id,
                    categoryId: template.categoryId,
                    recurringTaskId: template.id,
                    title: template.title,
                    description: template.description,
                    scheduledAt: resolved.utcDate,
                    priority: template.priority,
                    position: count,
                    status: 'PLANNED',
                  },
                });

                if (settings.notificationsEnabled) {
                  const leadMinutes = template.reminderMinutes !== null ? template.reminderMinutes : settings.defaultReminderMinutes;
                  const scheduledFor = new Date(resolved.utcDate.getTime() - leadMinutes * 60 * 1000);

                  if (scheduledFor.getTime() > Date.now()) {
                    const reminder = await tx.reminderSchedule.create({
                      data: {
                        taskId: newTask.id,
                        userId: user.id,
                        scheduledFor,
                        status: 'SCHEDULED',
                        reminderMinutes: leadMinutes,
                      },
                    });

                    await tx.notificationQueue.create({
                      data: {
                        reminderScheduleId: reminder.id,
                        userId: user.id,
                        status: 'PENDING',
                        availableAt: scheduledFor,
                      },
                    });
                  }
                }
              }
            }
          }
        });
      }
    }
    console.log('✅ Recurring task generation complete.');
  } catch (err) {
    console.error('❌ Error in recurring task generation worker:', err);
  } finally {
    isGenerating = false;
  }
}

export function startRecurringTaskWorker(): void {
  runRecurringTaskGeneration().catch(console.error);
  generationInterval = setInterval(() => {
    runRecurringTaskGeneration().catch(console.error);
  }, 60 * 60 * 1000);
}

export function stopRecurringTaskWorker(): void {
  if (generationInterval) {
    clearInterval(generationInterval);
    generationInterval = null;
  }
}
