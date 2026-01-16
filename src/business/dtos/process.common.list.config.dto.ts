import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ProcessCommonListConfigDto {
  @IsString()
  @IsOptional()
  @Expose()
  sql?: string;

  @IsOptional()
  @IsString()
  @Expose()
  comments?: string;

  @IsOptional()
  @IsString()
  @Expose()
  order?: string;

  @IsArray()
  @IsOptional()
  @Expose()
  metrics?: string[];

  @IsArray()
  @IsOptional()
  @Expose()
  columns?: string[];
}
