import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber, InsertEvent } from 'typeorm';
import { ScheduleBroadcastEntity } from '../entities/schedule.broadcast.entity';
import { ScheduleBroadcastJob } from '../jobs/schedule.broadcast.job';

@EventSubscriber()
export class ScheduleBroadcastSubscriber extends CommonSubscriber<ScheduleBroadcastEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ScheduleBroadcastJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ScheduleBroadcastEntity;
  }

  beforeInsert(evt: InsertEvent<ScheduleBroadcastEntity>) {
    const now = new Date();
    if (evt?.entity?.scheduled_at < now) evt.entity.scheduled_at = now;
  }
}
