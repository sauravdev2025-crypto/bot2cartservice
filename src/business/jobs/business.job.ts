import { Injectable } from '@nestjs/common';
import { CacheService, CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BusinessEntity } from '../entities/business.entity';

@Injectable()
export class BusinessJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly cacheService: CacheService
  ) {
    super('e4404373285ba072d374bc17008b03f1');
  }
  async handle(evt: DatabaseEventDto<BusinessEntity>) {
    await this.resetCache(evt);

    return evt.entity;
  }

  async resetCache(evt: DatabaseEventDto<BusinessEntity>) {
    const key = `business.${evt.entity.id}.details`;
    return this.cacheService.set(key, null);
  }
}
