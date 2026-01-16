import { Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Length, Max } from 'class-validator';

export class BusinessParamDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  second_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  account_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(10000000)
  @IsPositive()
  businessId?: number;

  @IsOptional()
  @Expose()
  @Length(3, 10000)
  slug?: string;
}
