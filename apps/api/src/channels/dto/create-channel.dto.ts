import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateChannelDto {
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
