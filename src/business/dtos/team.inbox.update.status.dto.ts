import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TeamInboxStatusTypeEnum } from '../enums/team.inbox.status.type.enum';

export class TeamInboxUpdateStatusDto {
  @Expose()
  @IsNotEmpty()
  @IsEnum(TeamInboxStatusTypeEnum)
  status_id: TeamInboxStatusTypeEnum;
}
