import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class SetBusinessSettingsDto {
  @Expose()
  @IsBoolean()
  @IsOptional()
  is_private_number?: boolean;

  @Expose()
  @IsOptional()
  user_reminder_preference?: any;
}
