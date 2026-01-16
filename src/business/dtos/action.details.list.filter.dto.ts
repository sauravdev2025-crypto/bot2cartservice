import { CommonListFilterDto } from '@servicelabsco/slabs-access-manager';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { ActionTypeEnum } from '../enums/action.type.enum';

export class ActionDetailsListFilterDto extends CommonListFilterDto {
  @Expose()
  @IsOptional()
  type_id?: ActionTypeEnum;
}
