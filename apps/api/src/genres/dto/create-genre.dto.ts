import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGenreDto {
  // Solo relevante para ROOT/SUPER_ADMIN gestionando un tenant que no es el suyo.
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
