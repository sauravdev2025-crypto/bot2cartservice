import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExternalValidationUrlDto {
  @ApiProperty({
    description: 'Validation URL',
    example: 'https://example.com/validate/abcdef',
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Expiration date and time for the validation URL',
    example: '2024-12-31T23:59:59.000Z',
  })
  @Expose()
  @IsNotEmpty()
  expires_at: Date;
}
