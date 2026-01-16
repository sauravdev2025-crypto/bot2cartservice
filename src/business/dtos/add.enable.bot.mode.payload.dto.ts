import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class AddEnableBotModePayloadDto {
  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  is_assigned_to_bot: boolean;
}
