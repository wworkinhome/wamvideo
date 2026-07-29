import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { ProfileContextService } from '../common/profile-context.service';
import { TenantAccessService } from '../common/tenant-access.service';

@Global()
@Module({
  providers: [PrismaService, TenantContextService, ProfileContextService, TenantAccessService],
  exports: [PrismaService, TenantContextService, ProfileContextService, TenantAccessService],
})
export class PrismaModule {}
