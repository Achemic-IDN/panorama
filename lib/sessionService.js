import { prisma } from "./prisma";

export async function createSession(staffId, maxAgeSeconds) {
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
  return prisma.session.create({
    data: { staffId: parseInt(staffId, 10), expiresAt },
  });
}

export async function revokeSession(sessionId) {
  if (!sessionId) return;
  return prisma.session.update({ where: { id: sessionId }, data: { revoked: true } });
}

export async function revokeAllSessionsForStaff(staffId) {
  return prisma.session.updateMany({
    where: { staffId: parseInt(staffId, 10) },
    data: { revoked: true },
  });
}

export async function validateSession(sessionId) {
  if (!sessionId) return null;
  const sess = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!sess || sess.revoked) return null;
  if (sess.expiresAt && sess.expiresAt.getTime() < Date.now()) return null;
  return sess;
}
