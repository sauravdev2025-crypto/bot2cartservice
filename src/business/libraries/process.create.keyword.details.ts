import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { ProcessCommonData } from '@servicelabsco/slabs-access-manager';
import { CreateKeywordDetailDto } from '../dtos/create.keyword.detail.dto';
import { BusinessEntity } from '../entities/business.entity';
import { KeywordActionDetailEntity } from '../entities/keyword.action.detail.entity';
import { KeywordDetailEntity } from '../entities/keyword.detail.entity';
import { KeywordMatchingTypeEnum } from '../enums/keyword.matching.type.enum';
import { In, Not } from 'typeorm';

export class ProcessCreateKeywordDetails extends ProcessCommonData {
  protected keywordDetails: KeywordDetailEntity;
  protected payload: CreateKeywordDetailDto;

  constructor(protected readonly business: BusinessEntity) {
    super();
  }

  async process(payload: CreateKeywordDetailDto) {
    this.payload = payload;

    await this.init();
    await this.validate();

    await this.save();
    await this.saveKeywordAction();

    return this.keywordDetails;
  }

  async init() {
    let kd = KeywordDetailEntity.create({ business_id: this.business.id });
    if (this.payload.id) kd = await KeywordDetailEntity.first(this.payload.id);

    this.keywordDetails = kd;
  }

  async validate() {
    if (this.payload?.id) return;

    const existingKeywords = await KeywordDetailEntity.find({
      where: {
        matching_type_id: this.payload.matching_type_id,
        business_id: this.business.id,
      },
    });

    existingKeywords.forEach((existKey) => {
      const words = existKey?.keywords;

      if (this.payload.keywords.some((keyword) => words?.includes(keyword)))
        throw new OperationException('A keyword with the same name and matching type already exists.');
    });
  }

  async saveKeywordAction() {
    for await (const id of this.payload?.action_ids) {
      const keywordAction = await KeywordActionDetailEntity.firstOrCreate({
        action_id: id,
        keyword_id: this.keywordDetails.id,
        business_id: this.business.id,
      });

      keywordAction.active = true;

      await keywordAction.save();
    }

    const newKeywords = await KeywordActionDetailEntity.find({
      where: { business_id: this.business.id, keyword_id: this.keywordDetails.id, action_id: Not(In(this.payload.action_ids)) },
    });

    for await (const newKeyword of newKeywords) {
      const del = await KeywordActionDetailEntity.first(newKeyword?.id);
      await del.softDelete();
    }
  }

  async save() {
    this.keywordDetails.name = this.payload.name;
    this.keywordDetails.matching_type_id = this.payload.matching_type_id;
    this.keywordDetails.active = true;
    this.keywordDetails.keywords = this.payload.keywords;

    if (this.payload.fuzzy_matching_rage && KeywordMatchingTypeEnum.FUZZY) {
      this.keywordDetails.attributes = { ...this.keywordDetails.attributes, fuzzy_matching_rage: this.payload.fuzzy_matching_rage };
    }

    return this.keywordDetails.save();
  }
}
