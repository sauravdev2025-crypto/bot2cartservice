import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BusinessSettingDetailEntity } from '../entities/business.setting.detail.entity';

@Injectable()
export class BusinessSettingDetailJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('eb79ef4172c04abb844f0db7978ca0d5');
  }
  async handle(evt: DatabaseEventDto<BusinessSettingDetailEntity>) {
    return evt.entity;
  }
}
