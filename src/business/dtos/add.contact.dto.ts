import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IdPayloadDto } from '../../common/dtos/id.payload.dto';

export class AddContactDto extends IdPayloadDto {
  @ApiProperty({
    description: 'Name of the contact',
    example: 'John Doe',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Mobile number of the contact',
    example: '1234567890',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({
    description: 'This is an internal identifier string',
    example: 'example-identifier12',
  })
  @Expose()
  @IsString()
  @IsOptional()
  identifier?: string;

  @ApiProperty({
    description: "Dialing code of the contact's country",
    example: 91,
  })
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  dialing_code: number;

  @ApiPropertyOptional({
    description: 'ID of the manager assigned to the contact',
    example: 42,
  })
  @Expose()
  @IsNumber()
  @IsOptional()
  managed_by?: number;

  @ApiPropertyOptional({
    description: 'Whether the contact is assigned to a bot',
    example: true,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  is_assigned_to_bot?: boolean;

  @ApiPropertyOptional({
    description: 'Custom attributes for the contact',
    example: [
      { key: 'birthday', value: '1990-01-01' },
      { key: 'city', value: 'New York' },
    ],
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
  custom_attributes: CustomAttributesType;
}

export type CustomAttributesType = { key: string; value: string }[];
