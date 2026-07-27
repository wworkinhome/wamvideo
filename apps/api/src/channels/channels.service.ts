import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(category?: string) {
    const { start, end } = todayRange();
    return this.prisma.channel.findMany({
      where: {
        isActive: true,
        ...(category && category !== 'Todos' ? { category } : {}),
      },
      include: {
        epgPrograms: {
          where: { startsAt: { lt: end }, endsAt: { gt: start } },
          orderBy: { startsAt: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const { start, end } = todayRange();
    const channel = await this.prisma.channel.findUnique({
      where: { slug },
      include: {
        epgPrograms: {
          where: { startsAt: { lt: end }, endsAt: { gt: start } },
          orderBy: { startsAt: 'asc' },
        },
      },
    });
    if (!channel) {
      throw new NotFoundException('Canal no encontrado');
    }
    return channel;
  }

  create(dto: CreateChannelDto) {
    return this.prisma.channel.create({ data: dto });
  }

  async update(id: string, dto: UpdateChannelDto) {
    await this.ensureExists(id);
    return this.prisma.channel.update({ where: { id }, data: dto });
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
