import { IsArray, IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSeriesDto {
  // Solo relevante para ROOT/SUPER_ADMIN gestionando un tenant que no es el suyo.
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsString()
  backdropUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreIds?: string[];
}
