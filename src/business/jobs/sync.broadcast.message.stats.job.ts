import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, SqlService } from '@servicelabsco/nestjs-utility-services';
import { ScheduleBroadcastEntity } from '../entities/schedule.broadcast.entity';

@Injectable()
export class SyncBroadcastMessageStatsJob extends CommonJob {
  protected priority: number = 15;
  protected timeout = 10000;
  protected noDuplicate = true;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly sqlService: SqlService
  ) {
    super('cde83408495f2c2afc0578a908bf584f');
  }

  async handle(id: number) {
    const r = await ScheduleBroadcastEntity.first(id);
    if (!r) return;

    const sql = `SELECT min(initiated_at) start_time,count(1)COUNT,sum(CASE WHEN a.sent_at IS NOT NULL THEN 1 ELSE 0 END)total_sent, sum(CASE WHEN a.read_at IS NOT NULL THEN 1 ELSE 0 END) total_read,sum(CASE WHEN a.delivered_at IS NOT NULL THEN 1 ELSE 0 END)delivered_sent,sum(CASE WHEN a.initiated_at IS NOT NULL THEN 1 ELSE 0 END)initiated_at,sum(CASE WHEN a.is_error THEN 1 ELSE 0 END)error,max(sent_at)max_sent_at FROM bz_broadcast_messages a WHERE source_type='440ad70ca5c4f7ea33fd6ebd4cdaa14f' AND a.source_id=${id} AND a.deleted_at IS NULL`;
    const record = await this.sqlService.readFirst(sql);

    const { start_time, count, total_sent, delivered_sent, initiated_at, error, max_sent_at, total_read } = record;
    r.attributes = { ...r.attributes, sent: total_sent, delivered: delivered_sent, initiated: initiated_at, error, read: total_read };

    if (!r.initiated_at) r.initiated_at = start_time;

    if (!r.completed_at && r?.attributes?.total === initiated_at) r.completed_at = new Date();

    return r.save();
  }
}
