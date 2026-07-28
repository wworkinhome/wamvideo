import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isKids?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(4)
  pinCode?: string;
}
