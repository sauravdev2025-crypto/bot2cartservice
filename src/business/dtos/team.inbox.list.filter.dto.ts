import { CommonListFilterDto } from '@servicelabsco/slabs-access-manager';
import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { TeamInboxStatusTypeEnum } from '../enums/team.inbox.status.type.enum';

export class TeamInboxListFilterDto extends CommonListFilterDto {
  mobile?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  assign_me?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  is_expired?: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose()
  is_assigned_to_bot?: boolean;

  @Expose()
  @IsOptional()
  @IsArray()
  assignee_ids?: number[];

  @Expose()
  @IsOptional()
  @IsArray()
  status_ids?: TeamInboxStatusTypeEnum[];

  @Expose()
  @IsOptional()
  @IsBoolean()
  active_chat?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  unread?: boolean;
}
