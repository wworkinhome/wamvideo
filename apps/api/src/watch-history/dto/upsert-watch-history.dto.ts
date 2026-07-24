import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertWatchHistoryDto {
  @IsOptional()
  @IsString()
  movieId?: string;

  @IsOptional()
  @IsString()
  episodeId?: string;

  @IsInt()
  @Min(0)
  progressSeconds: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
