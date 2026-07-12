import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// ============================================================
// Password Security (bcryptjs)
// ============================================================

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password securely.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored password hash.
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// ============================================================
// JWT Token Security (jsonwebtoken)
// ============================================================

export interface JwtPayload {
  sub: string;
}

/**
 * Signs a JWT with the user's ID as the sub claim.
 * Expiration is locked at exactly 24 hours.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verifies a JWT and extracts the typed payload.
 * Throws an error if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (!decoded || typeof decoded !== 'object' || !decoded['sub']) {
    throw new jwt.JsonWebTokenError('Invalid token payload structure');
  }
  return {
    sub: decoded['sub'] as string,
  };
}
