import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { TenantAccessService } from '../common/tenant-access.service';
import { resolveTargetTenantId } from '../common/tenant-resolution.util';
import { CONTENT_MANAGER_ROLES } from '../common/constants';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { slugify } from '../common/slugify';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async findAll() {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    return this.prisma.genre.findMany({ where: { tenant_id }, orderBy: { name: 'asc' } });
  }

  async create(dto: CreateGenreDto, user: AuthenticatedUser) {
    const tenant_id = await resolveTargetTenantId(this.tenantContext, user, dto.tenantId);
    this.tenantAccess.assertHasTenantPermission(user, tenant_id, CONTENT_MANAGER_ROLES);

    return this.prisma.genre.create({
      data: { tenant_id, name: dto.name, slug: dto.slug ?? slugify(dto.name) },
    });
  }

  async update(id: string, dto: UpdateGenreDto, user: AuthenticatedUser) {
    const existing = await this.ensureExists(id);
    this.tenantAccess.assertHasTenantPermission(user, existing.tenant_id, CONTENT_MANAGER_ROLES);

    return this.prisma.genre.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
      },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const existing = await this.ensureExists(id);
    this.tenantAccess.assertHasTenantPermission(user, existing.tenant_id, CONTENT_MANAGER_ROLES);
    return this.prisma.genre.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      throw new NotFoundException('Género no encontrado');
    }
    return genre;
  }
}
