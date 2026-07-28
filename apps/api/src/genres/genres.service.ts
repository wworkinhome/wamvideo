import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { slugify } from '../common/slugify';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll() {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    return this.prisma.genre.findMany({ where: { tenant_id }, orderBy: { name: 'asc' } });
  }

  async create(dto: CreateGenreDto) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    return this.prisma.genre.create({
      data: { tenant_id, name: dto.name, slug: dto.slug ?? slugify(dto.name) },
    });
  }

  async update(id: string, dto: UpdateGenreDto) {
    await this.ensureExists(id);
    return this.prisma.genre.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.genre.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      throw new NotFoundException('Género no encontrado');
    }
  }
}
