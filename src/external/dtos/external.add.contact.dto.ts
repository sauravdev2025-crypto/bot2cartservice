import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ExternalAddContactDto {
  @ApiProperty({
    description: 'Name of the contact',
    example: 'John Doe',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'This is an internal identifier string',
    example: 'example-identifier12',
  })
  @Expose()
  @IsString()
  @IsOptional()
  identifier?: string;

  @ApiProperty({
    description: 'Mobile number of the contact',
    example: '1234567890',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({
    description: "Dialing code of the contact's country",
    example: 91,
  })
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  dialing_code: number;

  @ApiPropertyOptional({
    description: 'email of the manager assigned to the contact',
    example: 'someone@example.com',
  })
  @Expose()
  @IsString()
  @IsEmail()
  @IsOptional()
  managed_by_email?: string;

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
  custom_attributes?: CustomAttributesType;
}

type CustomAttributesType = { key: string; value: string }[];
