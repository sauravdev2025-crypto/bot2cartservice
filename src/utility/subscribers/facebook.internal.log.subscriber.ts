import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { FacebookInternalLogEntity } from '../entities/facebook.internal.log.entity';
import { FacebookInternalLogJob } from '../jobs/facebook.internal.log.job';

@EventSubscriber()
export class FacebookInternalLogSubscriber extends CommonSubscriber<FacebookInternalLogEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: FacebookInternalLogJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return FacebookInternalLogEntity;
  }
}
