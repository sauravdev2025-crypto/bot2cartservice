import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { KeywordActionTriggerDetailEntity } from '../entities/keyword.action.trigger.detail.entity';
import { KeywordActionTriggerDetailJob } from '../jobs/keyword.action.trigger.detail.job';

@EventSubscriber()
export class KeywordActionTriggerDetailSubscriber extends CommonSubscriber<KeywordActionTriggerDetailEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: KeywordActionTriggerDetailJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return KeywordActionTriggerDetailEntity;
  }
}
