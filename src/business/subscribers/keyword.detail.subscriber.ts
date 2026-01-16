import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { KeywordDetailEntity } from '../entities/keyword.detail.entity';
import { KeywordDetailJob } from '../jobs/keyword.detail.job';

@EventSubscriber()
export class KeywordDetailSubscriber extends CommonSubscriber<KeywordDetailEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: KeywordDetailJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return KeywordDetailEntity;
  }
}
