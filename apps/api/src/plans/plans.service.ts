import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPlan(plan: any) {
  const { tenant_id, is_active, billing_interval, video_quality, max_profiles, max_devices, price, created_at, name, ...rest } = plan;
  return {
    ...rest,
    name,
    slug: slugify(name),
    priceCents: Math.round(Number(price) * 100),
    intervalDays: billing_interval === 'YEARLY' ? 365 : 30,
    maxProfiles: max_profiles,
    maxQuality: video_quality ?? 'HD',
  };
}

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll() {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const plans = await this.prisma.plan.findMany({
      where: { tenant_id, is_active: true },
      orderBy: { price: 'asc' },
    });
    return plans.map(mapPlan);
  }
}
