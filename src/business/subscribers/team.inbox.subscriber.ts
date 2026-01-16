import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { TeamInboxJob } from '../jobs/team.inbox.job';

@EventSubscriber()
export class TeamInboxSubscriber extends CommonSubscriber<TeamInboxEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: TeamInboxJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return TeamInboxEntity;
  }
}
