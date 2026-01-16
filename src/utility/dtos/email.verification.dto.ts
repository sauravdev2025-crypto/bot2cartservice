import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EmailVerificationDto {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  code: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  token: string;
}
