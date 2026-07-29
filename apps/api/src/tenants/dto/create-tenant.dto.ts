import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const TENANT_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;

export class CreateTenantDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsIn(TENANT_STATUSES)
  status?: (typeof TENANT_STATUSES)[number];
}
