import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { QuickReplyEntity } from '../entities/quick.reply.entity';
import { QuickReplyJob } from '../jobs/quick.reply.job';

@EventSubscriber()
export class QuickReplySubscriber extends CommonSubscriber<QuickReplyEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: QuickReplyJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return QuickReplyEntity;
  }
}
