import { IsOptional, IsString } from 'class-validator';

export class CreateFavoriteDto {
  @IsOptional()
  @IsString()
  movieId?: string;

  @IsOptional()
  @IsString()
  seriesId?: string;
}
