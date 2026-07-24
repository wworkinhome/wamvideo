import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto';

@Injectable()
export class WatchHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.watchHistory.findMany({
      where: { userId },
      include: { movie: true, episode: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  upsert(userId: string, dto: UpsertWatchHistoryDto) {
    const { movieId, episodeId, ...progress } = dto;

    if (!movieId && !episodeId) {
      throw new BadRequestException('Debe indicar movieId o episodeId');
    }

    if (movieId) {
      return this.prisma.watchHistory.upsert({
        where: { userId_movieId: { userId, movieId } },
        create: { userId, movieId, ...progress },
        update: { ...progress },
      });
    }

    return this.prisma.watchHistory.upsert({
      where: { userId_episodeId: { userId, episodeId: episodeId! } },
      create: { userId, episodeId, ...progress },
      update: { ...progress },
    });
  }
}
