import { Injectable } from '@nestjs/common';
import { CacheService, CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BusinessWebhookEntity } from '@servicelabsco/slabs-access-manager';

@Injectable()
export class LocalBusinessWebhookJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly cacheService: CacheService
  ) {
    super('1ab78bea89d605e9f421a2e974c4ebb6');
  }
  async handle(evt: DatabaseEventDto<BusinessWebhookEntity>) {
    await this.resetCache(evt);
    return evt.entity;
  }

  async resetCache(evt: DatabaseEventDto<BusinessWebhookEntity>) {
    const events = evt.entity.event_type;
    for (const event of events) {
      const key = `business.${evt.entity.business_id}.webhooks.${event}`;
      await this.cacheService.set(key, null);
    }
  }
}
