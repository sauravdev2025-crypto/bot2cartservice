import { IsString, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Example {
  @IsArray()
  header_text?: string[];

  @IsArray()
  body_text?: string[][];
}

class Button {
  @IsString()
  type: string;

  @IsString()
  text: string;

  @IsString()
  phone_number?: string;

  @IsString()
  url?: string;
}

class Component {
  @IsString()
  type: string;

  @IsString()
  format?: string;

  @IsString()
  text?: string;

  @ValidateNested()
  @Type(() => Example)
  example?: Example;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Button)
  buttons?: Button[];
}

export class WhatsappTemplateApprovalDto {
  @IsString()
  name: string;

  @IsString()
  language: string;

  @IsString()
  category: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Component)
  components: Component[];
}
