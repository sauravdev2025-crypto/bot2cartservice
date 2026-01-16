import { CommonListFilterDto } from '@servicelabsco/slabs-access-manager';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class BusinessUserListFilterDto extends CommonListFilterDto {
  @IsOptional()
  @Expose()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Expose()
  @IsString()
  role?: string;
}
