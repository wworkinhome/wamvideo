import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slugify';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ResolveTenantDto } from './dto/resolve-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tenant.findMany({ orderBy: { created_at: 'asc' } });
  }

  async resolve(query: ResolveTenantDto) {
    if (!query.domain && !query.slug) {
      throw new BadRequestException('Debe indicar domain o slug');
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: query.domain ? { domain: query.domain } : { slug: query.slug },
    });

    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new NotFoundException('Tenant no encontrado');
    }

    return tenant;
  }

  async create(dto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        domain: dto.domain,
        status: dto.status ?? 'ACTIVE',
        updated_at: new Date(),
      },
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.ensureExists(id);
    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.domain !== undefined ? { domain: dto.domain } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    // Elimina en cascada todo el contenido del tenant (movies/series/channels/genres/
    // plans referencian tenant_id con onDelete: Cascade en el schema) — se recomienda
    // suspender (status: SUSPENDED) en vez de borrar salvo que sea intencional.
    return this.prisma.tenant.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }
  }
}
