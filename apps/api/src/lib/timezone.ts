import { AppError } from '../middleware/errorHandler.js';
import { isValidGregorianDate } from '@ddt/shared';

// ============================================================
// Timezone and Wall-clock Resolution Utility (Phase 2)
// Uses native Node.js Date and Intl.DateTimeFormat
// ============================================================

/**
 * Validates whether the given string is a valid IANA timezone.
 * Throws VALIDATION_ERROR AppError if invalid.
 */
export function validateTimezone(timezone: string): void {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    throw new AppError(`Invalid timezone: ${timezone}`, 'VALIDATION_ERROR', 400);
  }
}

/**
 * Validates the YYYY-MM-DD calendar date format and Gregorian rules.
 * Throws VALIDATION_ERROR if invalid.
 */
export function validatePlannerDate(plannerDate: string): void {
  if (!isValidGregorianDate(plannerDate)) {
    throw new AppError(`Invalid calendar date: ${plannerDate}`, 'VALIDATION_ERROR', 400);
  }
}

/**
 * Validates HH:mm 24-hour time format.
 * Throws VALIDATION_ERROR if invalid.
 */
export function validateScheduledTime(scheduledTime: string): void {
  if (!/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)) {
    throw new AppError(`Invalid scheduled time format: ${scheduledTime}`, 'VALIDATION_ERROR', 400);
  }
}

/**
 * Returns the offset in milliseconds (localUtc - time) for a given timezone and UTC timestamp.
 */
function getTimezoneOffset(timezone: string, time: number): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(time);
  const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)!.value, 10);

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hour = getPart('hour');
  if (hour === 24) hour = 0;
  const minute = getPart('minute');
  const second = getPart('second');

  const localUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return localUtc - time;
}

/**
 * Formats a UTC timestamp to its local date/time parts in the given timezone.
 */
function formatToParts(timezone: string, time: number) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(time);
  const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)!.value, 10);

  let hour = getPart('hour');
  if (hour === 24) hour = 0;

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour,
    minute: getPart('minute'),
  };
}

/**
 * Resolves a wall-clock local date + time in an IANA timezone to a single UTC Date.
 * Handles DST transitions: throws error if ambiguous or nonexistent time.
 */
export function resolveWallClockToUtc(
  plannerDate: string,
  scheduledTime: string,
  timezone: string
): Date {
  validateTimezone(timezone);
  validatePlannerDate(plannerDate);
  validateScheduledTime(scheduledTime);

  const [yearStr, monthStr, dayStr] = plannerDate.split('-');
  const [hourStr, minStr] = scheduledTime.split(':');

  const year = parseInt(yearStr!, 10);
  const month = parseInt(monthStr!, 10);
  const day = parseInt(dayStr!, 10);
  const hour = parseInt(hourStr!, 10);
  const minute = parseInt(minStr!, 10);

  // Naive representation of local wall-clock components as if they were UTC
  const T = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  // Sample offsets around: T - 24 hours, T, T + 24 hours
  const t1 = T - 24 * 60 * 60 * 1000;
  const t2 = T;
  const t3 = T + 24 * 60 * 60 * 1000;

  const offsets = new Set<number>([
    getTimezoneOffset(timezone, t1),
    getTimezoneOffset(timezone, t2),
    getTimezoneOffset(timezone, t3),
  ]);

  const matches: number[] = [];

  for (const offset of offsets) {
    const candidateUtc = T - offset;
    const formatted = formatToParts(timezone, candidateUtc);

    if (
      formatted.year === year &&
      formatted.month === month &&
      formatted.day === day &&
      formatted.hour === hour &&
      formatted.minute === minute
    ) {
      matches.push(candidateUtc);
    }
  }

  // Deduplicate matches
  const uniqueMatches = Array.from(new Set(matches));

  if (uniqueMatches.length === 0) {
    throw new AppError(`Nonexistent local time during DST transition: ${plannerDate} ${scheduledTime}`, 'INVALID_LOCAL_TIME', 400);
  }

  if (uniqueMatches.length > 1) {
    throw new AppError(`Ambiguous local time during DST transition: ${plannerDate} ${scheduledTime}`, 'AMBIGUOUS_LOCAL_TIME', 400);
  }

  return new Date(uniqueMatches[0]!);
}

/**
 * Returns the current calendar date string (YYYY-MM-DD) in the given IANA timezone.
 */
export function getCurrentCalendarDate(timezone: string): string {
  validateTimezone(timezone);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(Date.now());
  const getPart = (type: string) => parts.find((p) => p.type === type)!.value;

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}
