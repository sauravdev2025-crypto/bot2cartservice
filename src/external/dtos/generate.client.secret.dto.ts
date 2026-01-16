import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateClientSecretDto {
  @ApiProperty({
    description: 'Name of the credentials',
    example: 'testing-credentials',
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;
}
