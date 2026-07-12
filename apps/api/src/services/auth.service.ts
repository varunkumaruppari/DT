import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../lib/crypto.js';
import { AppError } from '../middleware/errorHandler.js';
import type { RegisterRequest, LoginRequest, UserResponse } from '@ddt/shared';

// ============================================================
// Authentication Service
// Responsibilities: registration, password verification
// ============================================================

/**
 * Registers a new user and initializes their default UserSettings.
 * Uses a Prisma transaction for atomic safety.
 */
export async function registerUser(dto: RegisterRequest): Promise<UserResponse> {
  const normalizedEmail = dto.email.trim().toLowerCase();

  // Enforce unique email identity
  const existingUser = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null,
    },
  });

  if (existingUser) {
    throw new AppError('Email address is already registered', 'EMAIL_ALREADY_EXISTS', 400);
  }

  // Hash password securely
  const passwordHash = await hashPassword(dto.password);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        displayName: dto.displayName.trim(),
      },
    });

    // Initialize required UserSettings foundation record
    await tx.userSettings.create({
      data: {
        userId: newUser.id,
        timezone: 'UTC', // Default fallback, updated later via settings onboarding
      },
    });

    return newUser;
  });

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

/**
 * Authenticates a user and verifies credentials.
 */
export async function authenticateUser(dto: LoginRequest): Promise<UserResponse> {
  const normalizedEmail = dto.email.trim().toLowerCase();

  // Locate active user
  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  // Compare submitted credentials against stored hash
  const isValid = await comparePassword(dto.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

/**
 * Retrieves a user by their unique primary key.
 */
export async function getUserById(id: string): Promise<UserResponse> {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError('User not found', 'UNAUTHORIZED', 401);
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}
