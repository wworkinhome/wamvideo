import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
