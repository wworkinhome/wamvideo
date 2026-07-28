import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const STAFF_ROLES: Role[] = [
  Role.ROOT,
  Role.SUPER_ADMIN,
  Role.ADMIN_GENERAL,
  Role.ADMIN_TENANT,
  Role.EDITOR,
  Role.PRODUCER,
  Role.PREMIUM_USER,
];

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async hasPremiumAccess(user: RequestUser | null | undefined): Promise<boolean> {
    if (!user) {
      return false;
    }

    if (STAFF_ROLES.includes(user.role)) {
      return true;
    }

    const now = new Date();
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['ACTIVE', 'TRIALING'] },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        plan: { priceCents: { gt: 0 } },
      },
    });

    return subscription !== null;
  }
}
