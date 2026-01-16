import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommunicationWhatsappTemplateSampleDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  value: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  key: string;
}
