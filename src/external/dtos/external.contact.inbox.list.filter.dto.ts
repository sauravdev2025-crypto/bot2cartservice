import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExternalListFilterDto } from './external.list.filter.dto';
import { TeamInboxStatusTypeEnum } from '../../business/enums/team.inbox.status.type.enum';

export class ExternalContactInboxListFilterDto extends ExternalListFilterDto {
  @ApiPropertyOptional({
    description: 'Whether the inbox is expired',
    type: Boolean,
    example: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  is_expired?: boolean;

  @ApiPropertyOptional({
    description: 'Status ID of the team inbox',
    enum: TeamInboxStatusTypeEnum,
    example: TeamInboxStatusTypeEnum.OPEN,
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  status_id?: TeamInboxStatusTypeEnum;

  @ApiPropertyOptional({
    description: 'Whether the chat is active',
    type: Boolean,
    example: true,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  active_chat?: boolean;
}
