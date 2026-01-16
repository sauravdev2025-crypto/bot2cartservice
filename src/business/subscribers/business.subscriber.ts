import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { BusinessEntity } from '../entities/business.entity';
import { BusinessJob } from '../jobs/business.job';

@EventSubscriber()
export class BusinessSubscriber extends CommonSubscriber<BusinessEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: BusinessJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return BusinessEntity;
  }
}
