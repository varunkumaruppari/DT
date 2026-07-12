import { z } from 'zod';

// ============================================================
// Auth Zod Schemas — safe for browser & backend
// ============================================================

export const registerRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }).min(1, 'Email is required'),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  displayName: z.string().min(1, { message: 'Display name is required' }).max(50, { message: 'Display name is too long' }),
});

export const loginRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }).min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Enums matching schema.prisma exactly
export const themeEnumSchema = z.enum(['LIGHT', 'DARK', 'SYSTEM']);
export const weekDayEnumSchema = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
export const timeFormatEnumSchema = z.enum(['12_HOUR', '24_HOUR']);

export const updateSettingsRequestSchema = z.object({
  theme: themeEnumSchema.optional(),
  notificationsEnabled: z.boolean().optional(),
  defaultReminderMinutes: z.number().int().nonnegative().optional(),
  timezone: z.string().min(1, 'Timezone is required').optional(),
  weekStartsOn: weekDayEnumSchema.optional(),
  timeFormat: timeFormatEnumSchema.optional(),
}).strict(); // Disallow extra fields

// ============================================================
// TypeScript Types derived from schemas / API specs
// ============================================================

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type UpdateSettingsRequest = z.infer<typeof updateSettingsRequestSchema>;

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}

export interface UserSettingsResponse {
  id: string;
  userId: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
  notificationsEnabled: boolean;
  defaultReminderMinutes: number;
  soundEnabled: boolean;
  timezone: string;
  weekStartsOn: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  dateFormat: string;
  timeFormat: '12_HOUR' | '24_HOUR';
  createdAt: string;
  updatedAt: string;
}
