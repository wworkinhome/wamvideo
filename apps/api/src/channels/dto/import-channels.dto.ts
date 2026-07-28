import { IsString, MinLength } from 'class-validator';

export class ImportChannelsDto {
  // Contenido crudo de una playlist M3U/M3U8 extendida (#EXTM3U + líneas #EXTINF).
  @IsString()
  @MinLength(1)
  m3u: string;
}
