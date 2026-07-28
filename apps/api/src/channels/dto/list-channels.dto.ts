import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListChannelsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  q?: string;

  // Variante de `category`/`slug` puntual: traer varios canales específicos en un
  // solo round-trip (ej. destacados del home). Coma-separado: ?slugs=a,b,c
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').filter(Boolean) : value))
  @IsString({ each: true })
  slugs?: string[];

  // 'unchecked' = stream_status es null (nunca se corrió el chequeo para ese canal).
  @IsOptional()
  @IsIn(['ok', 'broken', 'unchecked'])
  status?: 'ok' | 'broken' | 'unchecked';
}
