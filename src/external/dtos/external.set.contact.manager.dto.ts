import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExternalSetContactManagerDto {
  @ApiProperty({
    description: 'Email address of the manager to assign',
    example: 'manager@example.com',
  })
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email?: string;
}

export class ExternalSetContactManagerParamsDto {
  @ApiProperty({
    description: 'WhatsApp ID of the contact',
    example: '1234567890',
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  wa_id?: string;
}
