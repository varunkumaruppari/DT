import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { UpdateSettingsRequest, UserSettingsResponse } from '@ddt/shared';
import type { UserSettings, Prisma } from '@prisma/client';

// ============================================================
// User Settings Service
// Responsibilities: retrieval and updates of preferences
// ============================================================

/**
 * Maps the Prisma database model properties to the shared API DTO.
 */
function mapToSettingsDto(settings: UserSettings): UserSettingsResponse {
  return {
    id: settings.id,
    userId: settings.userId,
    theme: settings.theme,
    language: settings.language,
    notificationsEnabled: settings.notificationsEnabled,
    defaultReminderMinutes: settings.defaultReminderMinutes,
    soundEnabled: settings.soundEnabled,
    timezone: settings.timezone,
    weekStartsOn: settings.weekStartsOn,
    dateFormat: settings.dateFormat,
    // Convert H12/H24 database enum values back to 12_HOUR / 24_HOUR as required by API DTO
    timeFormat: settings.timeFormat === 'H12' ? '12_HOUR' : '24_HOUR',
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

/**
 * Retrieves the settings record for the given user.
 */
export async function getSettingsByUserId(userId: string): Promise<UserSettingsResponse> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    throw new AppError('UserSettings not found for authenticated profile', 'NOT_FOUND', 404);
  }

  return mapToSettingsDto(settings);
}

/**
 * Updates the user settings. Filters and applies only allowed DTO fields.
 */
export async function updateSettings(
  userId: string,
  dto: UpdateSettingsRequest
): Promise<UserSettingsResponse> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    throw new AppError('UserSettings not found for authenticated profile', 'NOT_FOUND', 404);
  }

  const updateData: Prisma.UserSettingsUpdateInput = {};

  if (dto.theme !== undefined) updateData.theme = dto.theme;
  if (dto.notificationsEnabled !== undefined) {
    updateData.notificationsEnabled = dto.notificationsEnabled;
  }
  if (dto.defaultReminderMinutes !== undefined) {
    updateData.defaultReminderMinutes = dto.defaultReminderMinutes;
  }
  if (dto.timezone !== undefined) updateData.timezone = dto.timezone;
  if (dto.weekStartsOn !== undefined) updateData.weekStartsOn = dto.weekStartsOn;
  if (dto.timeFormat !== undefined) {
    // Map DTO enum representation back to database Prisma enum value
    updateData.timeFormat = dto.timeFormat === '12_HOUR' ? 'H12' : 'H24';
  }

  const updatedSettings = await prisma.userSettings.update({
    where: { userId },
    data: updateData,
  });

  return mapToSettingsDto(updatedSettings);
}
