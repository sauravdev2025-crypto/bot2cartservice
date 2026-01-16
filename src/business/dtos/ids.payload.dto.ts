import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
export class IdsPayloadDto {
  @Expose()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  ids?: number[];
}
