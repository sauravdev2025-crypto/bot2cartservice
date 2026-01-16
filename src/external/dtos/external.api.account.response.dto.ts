import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ExternalApiAccountResponseDto {
  @ApiProperty({
    description: 'Credentials Name',
    example: 'development_cred',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'API client identifier',
    example: 'api_client_1234567890abcdef',
  })
  @Expose()
  identifier: string;

  @ApiProperty({
    description: 'API client secret',
    example: 'secretkey_0987654321fedcba',
  })
  @Expose()
  credential: string;
}
