import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapPlan } from '../plans/plans.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

const ACTIVE_STATUSES = ['ACTIVE', 'TRIALING'] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSubscription(subscription: any) {
  const { start_date, end_date, plans, plan_id, user_id, trial_ends_at, auto_renew, created_at, ...rest } = subscription;
  return {
    ...rest,
    startsAt: start_date,
    endsAt: end_date,
    plan: mapPlan(plans),
  };
}

function computeEndDate(startDate: Date, billingInterval: string): Date {
  const endDate = new Date(startDate);
  if (billingInterval === 'YEARLY') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }
  return endDate;
}

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { user_id: userId, status: { in: [...ACTIVE_STATUSES] } },
      include: { plans: true },
      orderBy: { created_at: 'desc' },
    });
    return subscription ? mapSubscription(subscription) : null;
  }

  async subscribe(userId: string, dto: CreateSubscriptionDto) {
    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan || !plan.is_active) {
      throw new NotFoundException('Plan no encontrado');
    }

    const now = new Date();
    await this.prisma.subscription.updateMany({
      where: { user_id: userId, status: { in: [...ACTIVE_STATUSES] } },
      data: { status: 'CANCELED', end_date: now },
    });

    const endDate = computeEndDate(now, plan.billing_interval);

    const subscription = await this.prisma.subscription.create({
      data: {
        user_id: userId,
        plan_id: plan.id,
        status: 'ACTIVE',
        start_date: now,
        end_date: endDate,
      },
      include: { plans: true },
    });

    if (Number(plan.price) > 0) {
      await this.prisma.payment.create({
        data: {
          user_id: userId,
          subscription_id: subscription.id,
          plan_id: plan.id,
          provider: 'MANUAL',
          status: 'COMPLETED',
          amount: plan.price,
          currency: plan.currency,
          paid_at: now,
        },
      });
    }

    return mapSubscription(subscription);
  }

  async cancel(userId: string) {
    const active = await this.prisma.subscription.findFirst({
      where: { user_id: userId, status: { in: [...ACTIVE_STATUSES] } },
    });

    if (!active) {
      throw new BadRequestException('No tienes una suscripción activa');
    }

    return this.prisma.subscription.update({
      where: { id: active.id },
      data: { status: 'CANCELED', end_date: new Date() },
    });
  }
}
