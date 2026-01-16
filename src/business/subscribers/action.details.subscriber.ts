import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ActionDetailsEntity } from '../entities/action.details.entity';
import { ActionDetailsJob } from '../jobs/action.details.job';

@EventSubscriber()
export class ActionDetailsSubscriber extends CommonSubscriber<ActionDetailsEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ActionDetailsJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ActionDetailsEntity;
  }
}
