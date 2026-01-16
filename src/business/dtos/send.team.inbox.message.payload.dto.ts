import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendTeamInboxMessagePayloadDto {
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  template_id: number;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  contact_id: number;

  @Expose()
  @IsOptional()
  custom_attributes: { [key: string]: string };
}

export class SendTeamInboxSimpleMessagePayloadDto {
  @Expose()
  @IsOptional()
  @IsString()
  data?: string;

  @Expose()
  @IsOptional()
  @IsString()
  sticker?: string;

  @Expose()
  @IsOptional()
  attachment?: {
    name: string;
    type: any;
    link: string;
  };
}
