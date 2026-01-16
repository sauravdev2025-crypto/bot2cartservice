import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePartnerBusinessDto {
  @ApiProperty({
    description: 'Name of the business',
    example: 'My Company',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  business_name: string;

  @ApiProperty({
    description: 'Owner email address',
    example: 'owner@example.com',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  owner_email: string;

  @ApiProperty({
    description: 'Owner name',
    example: 'John Doe',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  owner_name: string;

  @ApiProperty({
    description: 'Password for owner user',
    example: 'StrongPassword123!',
    minLength: 8,
    maxLength: 64,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  password: string;
}
