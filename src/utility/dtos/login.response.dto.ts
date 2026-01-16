import { IsBoolean, IsOptional } from 'class-validator';

export class LoginResponseDto {
  @IsOptional()
  credential?: string;

  @IsOptional()
  auth?: string;

  @IsOptional()
  user?: any;

  @IsBoolean()
  @IsOptional()
  two_factor_required?: boolean;

  @IsOptional()
  businesses?: any[];

  @IsOptional()
  invitations?: any[];
}
