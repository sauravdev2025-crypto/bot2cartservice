import { Expose } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
export class IdPayloadDto {
  @IsOptional()
  @Expose()
  @IsNumber()
  id?: number;
}
