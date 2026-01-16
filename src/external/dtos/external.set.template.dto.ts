import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ExternalSetTemplateDto {
  @Expose()
  @IsNotEmpty()
  template_config: any;
}
