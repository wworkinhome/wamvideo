import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateChannelDto {
  // Solo relevante para ROOT/SUPER_ADMIN gestionando un tenant que no es el suyo.
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  streamUrl: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
