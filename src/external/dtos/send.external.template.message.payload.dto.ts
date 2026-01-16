import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ListMessagePayloadDto } from '../../business/dtos/list.message.payload.dto';

import { ValidateIf } from 'class-validator';

export class ExternalMessageCommonPayloadDto {
  @ApiProperty({ description: 'WhatsApp ID (if this is passed, this will take precedence)', example: '919876543210' })
  @Expose()
  @IsString()
  @IsOptional()
  @ValidateIf((o: ExternalMessageCommonPayloadDto) => {
    // wa_id is required if either dialing_code or mobile is missing
    return !o.dialing_code || !o.mobile;
  })
  @IsNotEmpty({ message: 'Either wa_id or both dialing_code and mobile must be provided.' })
  wa_id?: string;

  @ApiProperty({ description: 'Country dialing code', example: 91 })
  @Expose()
  @IsNumber()
  @ValidateIf((o: ExternalMessageCommonPayloadDto) => {
    // dialing_code is required if wa_id is not provided
    return !o.wa_id;
  })
  @IsNotEmpty({ message: 'Either wa_id or both dialing_code and mobile must be provided.' })
  dialing_code?: number;

  @ApiProperty({ description: 'Mobile number', example: 9876543210 })
  @Expose()
  @IsNumber()
  @ValidateIf((o: ExternalMessageCommonPayloadDto) => {
    // mobile is required if wa_id is not provided
    return !o.wa_id;
  })
  @IsNotEmpty({ message: 'Either wa_id or both dialing_code and mobile must be provided.' })
  mobile?: number;
}
export class ExternalListMessagePayloadDto extends ExternalMessageCommonPayloadDto {
  @ApiProperty({ description: 'Payload to send the list message', type: ListMessagePayloadDto })
  @Expose()
  @IsNotEmpty()
  @IsOptional() // In case you want to allow optional, otherwise remove this line
  @Type(() => ListMessagePayloadDto)
  @ValidateNested()
  payload: ListMessagePayloadDto;
}

export class SendExternalTemplateMessagePayloadDto extends ExternalMessageCommonPayloadDto {
  @ApiProperty({ description: 'Template identifier', example: 'welcome_message' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  template_identifier: string;

  @ApiPropertyOptional({
    description: 'Template variables',
    example: [{ key: 'name', value: 'John' }],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        value: { type: 'string' },
      },
    },
  })
  @Expose()
  @IsOptional()
  @IsArray()
  variables?: {
    key: string;
    value: string;
  }[];
}

export class SendExternalNormalMessagePayload extends ExternalMessageCommonPayloadDto {
  @ApiPropertyOptional({ description: 'Message text content', example: 'Hello there!' })
  @Expose()
  @IsOptional()
  @IsString()
  data?: string;

  @ApiPropertyOptional({ description: 'Sticker ID', example: 'sticker_123' })
  @Expose()
  @IsOptional()
  @IsString()
  sticker?: string;

  @ApiPropertyOptional({
    description: 'Attachment details',
    example: { name: 'document.pdf', type: 'application/pdf', link: 'https://example.com/document.pdf' },
    type: 'object',
    properties: {
      name: { type: 'string' },
      type: { type: 'string' },
      link: { type: 'string' },
    },
  })
  @Expose()
  @IsOptional()
  attachment?: {
    name: string;
    type: any;
    link: string;
  };
}
