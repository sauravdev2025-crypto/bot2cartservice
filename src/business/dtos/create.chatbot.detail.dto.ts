import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { IdPayloadDto } from '../../common/dtos/id.payload.dto';

export class CreateChatbotDetailDto extends IdPayloadDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  description?: string;
}
