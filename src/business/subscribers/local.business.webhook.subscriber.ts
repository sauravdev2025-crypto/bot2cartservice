import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { BusinessWebhookEntity } from '@servicelabsco/slabs-access-manager';
import { DataSource, EventSubscriber } from 'typeorm';
import { LocalBusinessWebhookJob } from '../jobs/local.business.webhook.job';

@EventSubscriber()
export class LocalBusinessWebhookSubscriber extends CommonSubscriber<BusinessWebhookEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: LocalBusinessWebhookJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return BusinessWebhookEntity;
  }
}
