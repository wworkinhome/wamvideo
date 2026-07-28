import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { slugify } from '../common/slugify';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPlan(plan: any) {
  const { tenant_id, is_active, billing_interval, video_quality, max_profiles, max_devices, price, created_at, name, ...rest } = plan;
  return {
    ...rest,
    name,
    slug: slugify(name),
    priceCents: Math.round(Number(price) * 100),
    intervalDays: billing_interval === 'YEARLY' ? 365 : 30,
    billingInterval: billing_interval,
    maxProfiles: max_profiles,
    maxDevices: max_devices,
    maxQuality: video_quality ?? 'HD',
    isActive: is_active,
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

  async findAllAdmin() {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const plans = await this.prisma.plan.findMany({ where: { tenant_id }, orderBy: { price: 'asc' } });
    return plans.map(mapPlan);
  }

  async create(dto: CreatePlanDto) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const plan = await this.prisma.plan.create({
      data: {
        tenant_id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency ?? 'USD',
        billing_interval: dto.billingInterval,
        max_profiles: dto.maxProfiles ?? 1,
        max_devices: dto.maxDevices ?? 1,
        video_quality: dto.videoQuality,
        is_active: dto.isActive ?? true,
      },
    });
    return mapPlan(plan);
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.ensureExists(id);
    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.billingInterval !== undefined ? { billing_interval: dto.billingInterval } : {}),
        ...(dto.maxProfiles !== undefined ? { max_profiles: dto.maxProfiles } : {}),
        ...(dto.maxDevices !== undefined ? { max_devices: dto.maxDevices } : {}),
        ...(dto.videoQuality !== undefined ? { video_quality: dto.videoQuality } : {}),
        ...(dto.isActive !== undefined ? { is_active: dto.isActive } : {}),
      },
    });
    return mapPlan(plan);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.plan.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }
  }
}
