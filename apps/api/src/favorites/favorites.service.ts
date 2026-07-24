import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        movie: { include: { genres: true } },
        series: { include: { genres: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateFavoriteDto) {
    if (!dto.movieId && !dto.seriesId) {
      throw new BadRequestException('Debe indicar movieId o seriesId');
    }

    return this.prisma.favorite.create({
      data: { userId, movieId: dto.movieId, seriesId: dto.seriesId },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.favorite.deleteMany({ where: { id, userId } });
  }
}
