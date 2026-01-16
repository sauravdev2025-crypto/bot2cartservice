import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IdPayloadDto } from '../../common/dtos/id.payload.dto';

export class CreateChatbotVersionDto extends IdPayloadDto {
  @Expose()
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsNotEmpty()
  raw_react_flow: any;
}
