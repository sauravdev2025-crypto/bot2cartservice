import { CommonAttributesDto } from '@servicelabsco/nestjs-utility-services';
export class TeamInboxAttributesDto extends CommonAttributesDto {
  unread_count?: number;
}
