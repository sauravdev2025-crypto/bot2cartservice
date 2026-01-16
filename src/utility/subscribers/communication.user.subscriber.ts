import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { CommunicationUserEntity } from '../entities/communication.user.entity';
import { CommunicationUserJob } from '../jobs/communication.user.job';

@EventSubscriber()
export class CommunicationUserSubscriber extends CommonSubscriber<CommunicationUserEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: CommunicationUserJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return CommunicationUserEntity;
  }
}
