import { IsOptional, IsString, MinLength } from 'class-validator';

export class ImportChannelsDto {
  // Solo relevante para ROOT/SUPER_ADMIN gestionando un tenant que no es el suyo.
  @IsOptional()
  @IsString()
  tenantId?: string;

  // Contenido crudo de una playlist M3U/M3U8 extendida (#EXTM3U + líneas #EXTINF).
  @IsString()
  @MinLength(1)
  m3u: string;
}
