import { CommonListFilterDto } from '@servicelabsco/slabs-access-manager';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class BroadcastMessageListFilterDto extends CommonListFilterDto {
  @Expose()
  @IsString()
  @IsOptional()
  source_type: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  source_id: number;

  @Expose()
  @IsString()
  @IsOptional()
  status?: string;

  @Expose()
  @IsBoolean()
  @IsOptional()
  is_error?: boolean;
}
