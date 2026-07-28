import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { ProfileContextService } from '../common/profile-context.service';

@Global()
@Module({
  providers: [PrismaService, TenantContextService, ProfileContextService],
  exports: [PrismaService, TenantContextService, ProfileContextService],
})
export class PrismaModule {}
