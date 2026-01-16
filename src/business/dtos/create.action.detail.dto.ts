import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IdPayloadDto } from '../../common/dtos/id.payload.dto';
import { ActionTypeEnum } from '../enums/action.type.enum';

export class CreateActionDetailDto extends IdPayloadDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @IsEnum(ActionTypeEnum)
  type_id: ActionTypeEnum;

  @Expose()
  @IsNotEmpty()
  parameters?: any;
}
