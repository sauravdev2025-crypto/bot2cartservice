import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { KeywordActionDetailEntity } from '../entities/keyword.action.detail.entity';
import { KeywordActionDetailJob } from '../jobs/keyword.action.detail.job';

@EventSubscriber()
export class KeywordActionDetailSubscriber extends CommonSubscriber<KeywordActionDetailEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: KeywordActionDetailJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return KeywordActionDetailEntity;
  }
}
