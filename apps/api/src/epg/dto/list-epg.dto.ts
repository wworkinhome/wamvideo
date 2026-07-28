import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListEpgDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  channelId?: string;

  // Fecha del día a consultar (YYYY-MM-DD). Default: hoy (UTC).
  @IsOptional()
  @IsDateString()
  date?: string;

  // Filtra los canales por categoría en el propio backend (a diferencia de traer
  // todo y filtrar en el cliente) — con miles de canales, evitar el round-trip
  // completo importa.
  @IsOptional()
  @IsString()
  category?: string;
}
