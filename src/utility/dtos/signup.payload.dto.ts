import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignupPayloadDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  password: string;

  // @Expose()
  // @IsString()
  // @IsNotEmpty()
  // mobile: number;

  // @Expose()
  // @IsString()
  // @IsNotEmpty()
  // dial_code: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;
}
