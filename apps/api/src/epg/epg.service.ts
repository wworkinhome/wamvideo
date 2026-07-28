import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { mapChannel, mapEpgProgram } from '../channels/channels.service';
import { ListEpgDto } from './dto/list-epg.dto';

@Injectable()
export class EpgService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // Devuelve, por canal, los programas que se solapan con el día pedido (UTC).
  // Paginado por canal (no por programa) — con miles de canales, cargar "todos" de
  // una vez tumba tanto la respuesta como el grid del frontend. Sin channelId trae
  // los canales del tenant (opcionalmente acotados por category); con channelId
  // acota a uno solo.
  async findGuide(query: ListEpgDto) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const day = query.date ? new Date(query.date) : new Date();
    const dayStart = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const where = {
      tenant_id,
      id: query.channelId,
      category: query.category,
    };

    const [channels, total] = await Promise.all([
      this.prisma.channel.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.channel.count({ where }),
    ]);

    const programs = await this.prisma.epgProgram.findMany({
      where: {
        channel_id: { in: channels.map((c) => c.id) },
        start_time: { lt: dayEnd },
        end_time: { gt: dayStart },
      },
      orderBy: { start_time: 'asc' },
    });

    const data = channels.map((channel) => ({
      channel: mapChannel(channel),
      programs: programs.filter((p) => p.channel_id === channel.id).map(mapEpgProgram),
    }));

    return { data, total, page: query.page, limit: query.limit };
  }
}
