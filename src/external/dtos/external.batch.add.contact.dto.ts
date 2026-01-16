import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { ExternalAddContactDto } from './external.add.contact.dto';

export class ExternalBatchAddContactDto {
  @ApiProperty({
    description: 'Array of contacts to be created',
    example: [
      {
        name: 'John Doe',
        mobile: '1234567890',
        dialing_code: 91,
        managed_by_email: 'manager@example.com',
        custom_attributes: [
          { key: 'birthday', value: '1990-01-01' },
          { key: 'city', value: 'New York' },
        ],
      },
      {
        name: 'Jane Smith',
        mobile: '0987654321',
        dialing_code: 91,
        managed_by_email: 'manager@example.com',
        custom_attributes: [
          { key: 'birthday', value: '1985-05-15' },
          { key: 'city', value: 'Los Angeles' },
        ],
      },
    ],
    type: [ExternalAddContactDto],
  })
  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ExternalAddContactDto)
  contacts: ExternalAddContactDto[];
}
