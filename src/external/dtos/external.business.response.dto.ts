import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ExternalBusinessResponseDto {
  @ApiProperty({
    description: 'Business ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Business name',
    example: 'My Company',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Whether the business is active',
    example: true,
  })
  @Expose()
  active: boolean;

  @ApiProperty({
    description: 'Verified at',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  verified_at: Date;

  @ApiProperty({
    description: 'Business creation date',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  created_at: Date;

  @ApiPropertyOptional({
    description: 'Business last update date',
    example: '2024-01-20T15:45:00Z',
  })
  @Expose()
  updated_at?: Date;

  @ApiPropertyOptional({
    description: 'Owner name',
    example: 'John Doe',
  })
  @Expose()
  owner_name?: string;

  @ApiPropertyOptional({
    description: 'Owner email',
    example: 'john.doe@example.com',
  })
  @Expose()
  owner_email?: string;
}
