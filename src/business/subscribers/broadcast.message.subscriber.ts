import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { BroadcastMessageJob } from '../jobs/broadcast.message.job';
import { BroadcastMessageService } from '../services/broadcast.message.service';

@EventSubscriber()
export class BroadcastMessageSubscriber extends CommonSubscriber<BroadcastMessageEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: BroadcastMessageJob,
    protected readonly broadcastMessageService: BroadcastMessageService
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return BroadcastMessageEntity;
  }

  async beforeInsert(event: InsertEvent<BroadcastMessageEntity>) {
    event.entity.status_id = this.broadcastMessageService.getCurrentStatus(event.entity);
  }

  async beforeUpdate(event: UpdateEvent<BroadcastMessageEntity>) {
    event.entity.status_id = this.broadcastMessageService.getCurrentStatus(event.entity as BroadcastMessageEntity);
  }
}
