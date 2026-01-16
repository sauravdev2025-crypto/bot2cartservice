import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ExternalApiLogEntity } from '../entities/external.api.log.entity';
import { ExternalApiLogJob } from '../jobs/external.api.log.job';

@EventSubscriber()
export class ExternalApiLogSubscriber extends CommonSubscriber<ExternalApiLogEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ExternalApiLogJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ExternalApiLogEntity;
  }
}
