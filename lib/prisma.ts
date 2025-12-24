import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure Prisma Client is available
let prismaClient: PrismaClient;

try {
  prismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  throw new Error(
    '@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.'
  );
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;

