import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity } from '@servicelabsco/slabs-access-manager';

@Injectable()
export class LocalBusinessUserJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('518a9cebd6b1c6b6238bcfe77983db1e');
  }
  async handle(evt: DatabaseEventDto<BusinessUserEntity>) {
    return evt.entity;
  }
}
