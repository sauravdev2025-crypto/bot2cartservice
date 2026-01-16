import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserSubscriber } from '@servicelabsco/slabs-access-manager';
import { DataSource, EventSubscriber } from 'typeorm';
import { BusinessEntity } from '../entities/business.entity';
import { BusinessJob } from '../jobs/business.job';
import { LocalBusinessUserJob } from '../jobs/local.business.user..job';

@EventSubscriber()
export class LocalBusinessUserSubscriber extends CommonSubscriber<BusinessUserSubscriber> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: LocalBusinessUserJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return BusinessEntity;
  }
}
