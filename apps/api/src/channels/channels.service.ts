import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEpgProgram(program: any) {
  const { start_time, end_time, channel_id, ...rest } = program;
  return { ...rest, startsAt: start_time, endsAt: end_time };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChannel(channel: any) {
  const { epg_programs, tenant_id, logo_url, stream_url, is_premium, ...rest } = channel;
  return {
    ...rest,
    logoUrl: logo_url,
    streamUrl: stream_url,
    isPremium: is_premium,
    epgPrograms: (epg_programs ?? []).map(mapEpgProgram),
  };
}

@Injectable()
export class ChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(category?: string) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const { start, end } = todayRange();
    const channels = await this.prisma.channel.findMany({
      where: {
        tenant_id,
        ...(category && category !== 'Todos' ? { category } : {}),
      },
      include: {
        epg_programs: {
          where: { start_time: { lt: end }, end_time: { gt: start } },
          orderBy: { start_time: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    return channels.map(mapChannel);
  }

  async findBySlug(slug: string) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const { start, end } = todayRange();
    const channel = await this.prisma.channel.findUnique({
      where: { tenant_id_slug: { tenant_id, slug } },
      include: {
        epg_programs: {
          where: { start_time: { lt: end }, end_time: { gt: start } },
          orderBy: { start_time: 'asc' },
        },
      },
    });
    if (!channel) {
      throw new NotFoundException('Canal no encontrado');
    }
    return mapChannel(channel);
  }

  async create(dto: CreateChannelDto) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const { logoUrl, streamUrl, isPremium, name, slug, category } = dto;
    const channel = await this.prisma.channel.create({
      data: {
        tenant_id,
        name,
        slug,
        category,
        logo_url: logoUrl,
        stream_url: streamUrl,
        is_premium: isPremium ?? false,
      },
      include: { epg_programs: true },
    });
    return mapChannel(channel);
  }

  async update(id: string, dto: UpdateChannelDto) {
    await this.ensureExists(id);
    const { logoUrl, streamUrl, isPremium, name, slug, category } = dto;
    const channel = await this.prisma.channel.update({
      where: { id },
      data: {
        name,
        slug,
        category,
        ...(logoUrl !== undefined ? { logo_url: logoUrl } : {}),
        ...(streamUrl !== undefined ? { stream_url: streamUrl } : {}),
        ...(isPremium !== undefined ? { is_premium: isPremium } : {}),
      },
      include: { epg_programs: true },
    });
    return mapChannel(channel);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.channel.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) {
      throw new NotFoundException('Canal no encontrado');
    }
  }
}
