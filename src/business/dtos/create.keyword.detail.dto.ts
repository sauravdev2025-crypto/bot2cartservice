import { Expose } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IdPayloadDto } from '../../common/dtos/id.payload.dto';
import { KeywordMatchingTypeEnum } from '../enums/keyword.matching.type.enum';

export class CreateKeywordDetailDto extends IdPayloadDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsArray()
  @IsNotEmpty()
  keywords: string[];

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @IsEnum(KeywordMatchingTypeEnum)
  matching_type_id: KeywordMatchingTypeEnum;

  @Expose()
  @IsOptional()
  @IsNumber()
  fuzzy_matching_rage?: number;

  @Expose()
  @IsNotEmpty()
  @IsArray()
  action_ids?: number[];
}
