import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UserProfileDto {
  @Expose()
  @IsString()
  @IsOptional()
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  image_url?: string;
}

export class ChangeUserMobileDto {
  @Expose()
  @IsNotEmpty()
  dialing_code: number;

  @Expose()
  @IsNotEmpty()
  mobile: number;

  @Expose()
  @IsOptional()
  @IsString()
  otp?: string;
}

export class ChangePasswordDto {
  @Expose()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Expose()
  @IsNotEmpty()
  old_password: string;
}
