import { CommonAttributesDto } from '@servicelabsco/nestjs-utility-services';
export class KeywordDetailAttributesDto extends CommonAttributesDto {
  fuzzy_matching_rage?: number;
  triggered?: number;
}
