import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CustomAttributesType } from '../../business/dtos/add.contact.dto';

export class ExternalSetContactDto {
  @ApiProperty({
    description: 'Email address of the manager',
    example: 'manager@example.com',
    required: false,
  })
  @Expose()
  @IsEmail()
  @IsOptional()
  @IsString()
  managed_by_email?: string;

  @ApiPropertyOptional({
    description: 'Whether the contact is assigned to a bot',
    example: true,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  is_assigned_to_bot?: boolean;

  @ApiProperty({
    description: 'Custom attributes for the contact',
    example: [
      { key: 'birthday', value: '1990-01-01' },
      { key: 'city', value: 'New York' },
    ],
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'birthday' },
        value: { type: 'string', example: '1990-01-01' },
      },
    },
  })
  @Expose()
  @IsOptional()
  custom_attributes?: CustomAttributesType;

  @ApiProperty({
    description: 'Name of the contact',
    example: 'John Doe',
    required: false,
  })
  @Expose()
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiProperty({
    description: 'Mobile number of the contact',
    example: '1234567890',
    required: false,
  })
  @Expose()
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiProperty({
    description: "Dialing code of the contact's country",
    example: 91,
    required: false,
  })
  @Expose()
  @IsNumber()
  @IsOptional()
  dialing_code?: number;
}
