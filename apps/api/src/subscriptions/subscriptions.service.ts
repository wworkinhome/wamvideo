import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async subscribe(userId: string, dto: CreateSubscriptionDto) {
    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan no encontrado');
    }

    await this.prisma.subscription.updateMany({
      where: { userId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
      data: { status: SubscriptionStatus.CANCELLED, endsAt: new Date() },
    });

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + plan.intervalDays);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        endsAt,
      },
      include: { plan: true },
    });

    if (plan.priceCents > 0) {
      await this.prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          provider: 'MANUAL',
          status: 'PAID',
          amountCents: plan.priceCents,
          currency: plan.currency,
        },
      });
    }

    return subscription;
  }

  async cancel(userId: string) {
    const active = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
    });

    if (!active) {
      throw new BadRequestException('No tienes una suscripción activa');
    }

    return this.prisma.subscription.update({
      where: { id: active.id },
      data: { status: SubscriptionStatus.CANCELLED, endsAt: new Date() },
    });
  }
}
