import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class ExternalListFilterDto {
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
}
