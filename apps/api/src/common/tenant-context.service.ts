import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_TENANT_SLUG } from './constants';

@Injectable()
export class TenantContextService {
  private cachedTenantId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getDefaultTenantId(): Promise<string> {
    if (this.cachedTenantId) {
      return this.cachedTenantId;
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT_SLUG } });
    if (!tenant) {
      throw new InternalServerErrorException(
        `No existe el tenant por defecto ("${DEFAULT_TENANT_SLUG}"). Ejecuta el seed antes de usar la API.`,
      );
    }

    this.cachedTenantId = tenant.id;
    return tenant.id;
  }
}
