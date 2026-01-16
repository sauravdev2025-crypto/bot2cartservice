import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IdPayloadDto } from '../../common/dtos/id.payload.dto';

export class AddQuickReplyBodyDto extends IdPayloadDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  shortcut: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  message: string;

  @Expose()
  @IsOptional()
  document?: {
    name: string;
    type: string;
    link: string;
  };
}
