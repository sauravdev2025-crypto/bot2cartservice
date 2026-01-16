import { CommonAttributesDto } from '@servicelabsco/nestjs-utility-services';
export class BroadcastMessageAttributesDto extends CommonAttributesDto {
  sent_by?: number;
  is_bot?: boolean;
  errors?: any;
}
