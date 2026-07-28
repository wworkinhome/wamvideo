import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ListChannelsDto } from './dto/list-channels.dto';
import { ImportChannelsDto } from './dto/import-channels.dto';
import { parseM3U, slugifyChannelName } from './m3u-parser';

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapChannel(channel: any) {
  const { tenant_id, logo_url, stream_url, is_premium, dvr_enabled, catchup_window_hours, timeshift_enabled, catchup_url_template, stream_status, stream_checked_at, epg_programs, ...rest } = channel;
  return {
    ...rest,
    logoUrl: logo_url,
    streamUrl: stream_url,
    isPremium: is_premium,
    dvrEnabled: dvr_enabled,
    catchupWindowHours: catchup_window_hours,
    timeshiftEnabled: timeshift_enabled,
    catchupUrlTemplate: catchup_url_template,
    streamStatus: stream_status,
    streamCheckedAt: stream_checked_at,
    ...(epg_programs ? { epgPrograms: epg_programs.map(mapEpgProgram) } : {}),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEpgProgram(program: any) {
  const { start_time, end_time, channel_id, ...rest } = program;
  return { ...rest, startsAt: start_time, endsAt: end_time };
}

@Injectable()
export class ChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(query: ListChannelsDto) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const where: Prisma.ChannelWhereInput = {
      tenant_id,
      slug: query.slugs && query.slugs.length > 0 ? { in: query.slugs } : undefined,
      category: query.category,
      country: query.country,
      name: query.q ? { contains: query.q, mode: 'insensitive' } : undefined,
      stream_status: query.status === 'unchecked' ? null : query.status,
    };

    const [data, total] = await Promise.all([
      this.prisma.channel.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.channel.count({ where }),
    ]);

    return { data: data.map(mapChannel), total, page: query.page, limit: query.limit };
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
    });
    return mapChannel(channel);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.channel.delete({ where: { id } });
  }

  // Bulk import desde una playlist M3U pegada a mano en el admin (o generada por un
  // script de tipo iptv-org). Por slug: si ya existe un canal con ese slug en el
  // tenant, actualiza su streamUrl/logo/categoría en vez de duplicarlo, así se puede
  // re-pegar la misma lista para refrescar URLs vencidas.
  async importFromM3U(dto: ImportChannelsDto) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const parsed = parseM3U(dto.m3u);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of parsed) {
      if (!item.streamUrl) {
        skipped++;
        continue;
      }
      const slug = slugifyChannelName(item.name);
      try {
        const existing = await this.prisma.channel.findFirst({ where: { tenant_id, slug } });
        if (existing) {
          await this.prisma.channel.update({
            where: { id: existing.id },
            data: {
              stream_url: item.streamUrl,
              logo_url: item.logoUrl ?? existing.logo_url,
              category: item.category ?? existing.category,
            },
          });
          updated++;
        } else {
          await this.prisma.channel.create({
            data: {
              tenant_id,
              name: item.name,
              slug,
              stream_url: item.streamUrl,
              logo_url: item.logoUrl,
              category: item.category,
            },
          });
          created++;
        }
      } catch {
        skipped++;
      }
    }

    return { total: parsed.length, created, updated, skipped };
  }

  private async ensureExists(id: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) {
      throw new NotFoundException('Canal no encontrado');
    }
  }
}
