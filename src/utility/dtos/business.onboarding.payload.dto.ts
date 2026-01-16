import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BusinessOnboardingPayloadDto {
  @Expose()
  @IsString()
  @IsOptional()
  mobile?: number;

  @Expose()
  @IsString()
  @IsOptional()
  dial_code?: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsOptional()
  is_partner_account?: boolean;
}
