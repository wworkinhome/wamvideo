import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

@Injectable()
export class SeriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.series.findMany({
      where: { isPublished: true },
      include: { genres: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const series = await this.prisma.series.findUnique({
      where: { slug },
      include: {
        genres: true,
        seasons: {
          orderBy: { number: 'asc' },
          include: { episodes: { orderBy: { number: 'asc' } } },
        },
      },
    });
    if (!series) {
      throw new NotFoundException('Serie no encontrada');
    }
    return series;
  }

  create(dto: CreateSeriesDto) {
    const { genreIds, ...data } = dto;
    return this.prisma.series.create({
      data: {
        ...data,
        genres: genreIds ? { connect: genreIds.map((id) => ({ id })) } : undefined,
      },
      include: { genres: true },
    });
  }

  async update(id: string, dto: UpdateSeriesDto) {
    const { genreIds, ...data } = dto;
    await this.ensureExists(id);
    return this.prisma.series.update({
      where: { id },
      data: {
        ...data,
        genres: genreIds ? { set: genreIds.map((genreId) => ({ id: genreId })) } : undefined,
      },
      include: { genres: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.series.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const series = await this.prisma.series.findUnique({ where: { id } });
    if (!series) {
      throw new NotFoundException('Serie no encontrada');
    }
  }
}
