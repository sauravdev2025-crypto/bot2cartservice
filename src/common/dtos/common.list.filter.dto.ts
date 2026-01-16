import { ListResponseFormatDto, DateFilterDto, NumberRangeFilterDto } from '@servicelabsco/slabs-access-manager';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, MinLength, IsNumber, Min, IsBoolean, ValidateNested, IsArray } from 'class-validator';

export class CommonListFilterDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Expose()
  search?: string;

  @IsOptional()
  @IsString()
  @Expose()
  limit?: string;

  @IsOptional()
  @IsString()
  @Expose()
  page?: string;

  @IsOptional()
  @IsBoolean()
  @Expose()
  stats?: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose()
  no_metrics?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ListResponseFormatDto)
  format?: ListResponseFormatDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateFilterDto)
  @Expose()
  date?: DateFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NumberRangeFilterDto)
  @Expose()
  amount?: NumberRangeFilterDto;

  @IsOptional()
  @Expose()
  aggregate?: Record<string, string>;

  @IsOptional()
  @Expose()
  filter_query?: string;

  @IsOptional()
  @Expose()
  listing_slug?: string;

  @IsOptional()
  @Expose()
  injected_query?: string;

  @IsOptional()
  @Expose()
  clauses?: string;

  @IsOptional()
  @Expose()
  order?: {};

  @IsOptional()
  @Expose()
  @IsBoolean()
  isDebugMode?: boolean;

  @Expose()
  @IsOptional()
  @IsArray()
  ids?: number[];
}
