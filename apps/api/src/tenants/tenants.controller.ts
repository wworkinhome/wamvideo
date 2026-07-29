import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ResolveTenantDto } from './dto/resolve-tenant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GLOBAL_ADMIN_ROLES } from '../common/constants';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // Público: el frontend lo usa para mapear un Host/dominio a un tenant.
  @Get('resolve')
  resolve(@Query() query: ResolveTenantDto) {
    return this.tenantsService.resolve(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...GLOBAL_ADMIN_ROLES)
  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...GLOBAL_ADMIN_ROLES)
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...GLOBAL_ADMIN_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...GLOBAL_ADMIN_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
