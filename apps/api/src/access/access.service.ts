import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { STAFF_ROLES } from '../common/constants';

interface RequestUser {
  id: string;
  roles?: string[];
}

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async hasPremiumAccess(user: RequestUser | null | undefined): Promise<boolean> {
    if (!user) {
      return false;
    }

    const roles = user.roles ?? [];
    if (STAFF_ROLES.some((role) => roles.includes(role))) {
      return true;
    }

    const now = new Date();
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        user_id: user.id,
        status: { in: ['ACTIVE', 'TRIALING'] },
        OR: [{ end_date: null }, { end_date: { gt: now } }],
        plans: { price: { gt: 0 } },
      },
    });

    return subscription !== null;
  }
}
