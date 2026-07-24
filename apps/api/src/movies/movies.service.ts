import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.movie.findMany({
      where: { isPublished: true },
      include: { genres: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: { genres: true },
    });
    if (!movie) {
      throw new NotFoundException('Película no encontrada');
    }
    return movie;
  }

  create(dto: CreateMovieDto) {
    const { genreIds, ...data } = dto;
    return this.prisma.movie.create({
      data: {
        ...data,
        genres: genreIds ? { connect: genreIds.map((id) => ({ id })) } : undefined,
      },
      include: { genres: true },
    });
  }

  async update(id: string, dto: UpdateMovieDto) {
    const { genreIds, ...data } = dto;
    await this.ensureExists(id);
    return this.prisma.movie.update({
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
    return this.prisma.movie.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Película no encontrada');
    }
  }
}
