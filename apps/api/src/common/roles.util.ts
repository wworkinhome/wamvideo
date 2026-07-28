import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export async function getOrCreateRole(prisma: PrismaService, name: string) {
  const existing = await prisma.roles.findUnique({ where: { name } });
  if (existing) {
    return existing;
  }
  return prisma.roles.create({ data: { id: randomUUID(), name } });
}
