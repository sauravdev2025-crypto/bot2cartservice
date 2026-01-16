import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';
import { ExternalSetContactDto } from './external.set.contact.dto';

export class ExternalBatchUpdateContactItemDto extends ExternalSetContactDto {
  @ApiProperty({
    description: 'WhatsApp ID of the contact to update',
    example: '911234567890',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  wa_id: string;
}

export class ExternalBatchUpdateContactDto {
  @ApiProperty({
    description: 'Array of contacts to be updated',
    example: [
      {
        wa_id: '911234567890',
        managed_by_email: 'manager@example.com',
        is_assigned_to_bot: true,
        display_name: 'Updated John Doe',
        custom_attributes: [
          { key: 'birthday', value: '1990-01-01' },
          { key: 'city', value: 'New York' },
        ],
      },
      {
        wa_id: '919876543210',
        managed_by_email: 'manager2@example.com',
        is_assigned_to_bot: false,
        display_name: 'Updated Jane Smith',
        custom_attributes: [
          { key: 'birthday', value: '1985-05-15' },
          { key: 'city', value: 'Los Angeles' },
        ],
      },
    ],
    type: [ExternalBatchUpdateContactItemDto],
  })
  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ExternalBatchUpdateContactItemDto)
  contacts: ExternalBatchUpdateContactItemDto[];
}
