import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

const BILLING_INTERVALS = ['MONTHLY', 'YEARLY'] as const;

export class CreatePlanDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsIn(BILLING_INTERVALS)
  billingInterval: (typeof BILLING_INTERVALS)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxProfiles?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDevices?: number;

  @IsOptional()
  @IsString()
  videoQuality?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
