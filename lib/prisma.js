import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

// audit middleware: automatically create a basic audit row whenever any
// Queue record is created or updated.  This is a lightweight example of
// event-driven logging; staffId cannot be determined here so it is left
// null.  Failures are ignored so they don’t interfere with normal flow.
prisma.$use(async (params, next) => {
  const result = await next(params);
  try {
    if (
      params.model === 'Queue' &&
      (params.action === 'create' || params.action === 'update')
    ) {
      await prisma.queueAuditLog.create({
        data: {
          queueId: result.id,
          action: params.action.toUpperCase(),
        },
      });
    }
  } catch (e) {
    console.error('audit middleware failed:', e);
  }
  return result;
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma