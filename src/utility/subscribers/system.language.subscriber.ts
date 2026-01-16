import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { SystemLanguageEntity } from '../entities/system.language.entity';
import { SystemLanguageJob } from '../jobs/system.language.job';

@EventSubscriber()
export class SystemLanguageSubscriber extends CommonSubscriber<SystemLanguageEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: SystemLanguageJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return SystemLanguageEntity;
  }
}
