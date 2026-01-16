import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IdPayloadDto } from '../../common/dtos/id.payload.dto';

export class BusinessUserInvitationDto extends IdPayloadDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  email?: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  role_id?: number;
}
