import { Injectable } from '@nestjs/common';
import { CommonJob, DateUtil, QueueService, SqlService } from '@servicelabsco/nestjs-utility-services';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { SendScheduledMessageJob } from './send.scheduled.message.job';

@Injectable()
export class SendScheduledMessagesJob extends CommonJob {
  protected priority = 20;
  protected noDuplicate = true;
  protected timeout = 1800000;
  private limit = 100;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly sqlService: SqlService,
    protected readonly sendScheduledMessageJob: SendScheduledMessageJob
  ) {
    super('13025c97583876695447c86e6b040b10');
  }
  async handle() {
    const date = DateUtil.getDateTimeInFormat();

    while (true) {
      const sql = `select id from bz_broadcast_messages a where a.deleted_at is null and a.scheduled_at < '${date}' and a.initiated_at is null and a.active = true and a.scheduled_at is not null order by id asc limit ${this.limit}`;

      const records = await this.sqlService.sql(sql);
      if (!records.length) return;

      for await (const record of records) {
        await this.handleMessage(record.id);
      }
    }
  }

  private async handleMessage(id: number) {
    const r = await BroadcastMessageEntity.first(id);
    if (!r) return;

    if (r.initiated_at) return;

    r.initiated_at = new Date();
    await r.save();

    return this.sendScheduledMessageJob.dispatch(r.id);
  }
}
