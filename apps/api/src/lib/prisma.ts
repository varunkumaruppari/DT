import { PrismaClient } from '@prisma/client';

// Singleton Prisma client — one instance per backend process.
// Never instantiate PrismaClient in individual request handlers.

declare global {
  var __prisma: PrismaClient | undefined; // NOSONAR: global singleton
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  // Safe connectivity check — equivalent to SELECT 1
  // Does not require any business model to exist.
  await prisma.$queryRaw`SELECT 1`;
}
