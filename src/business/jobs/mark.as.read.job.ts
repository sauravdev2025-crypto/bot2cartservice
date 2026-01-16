import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, SqlService } from '@servicelabsco/nestjs-utility-services';
import SourceHash from '../../config/source.hash';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { FacebookInternalMessageService } from '../services/facebook.internal.message.service';
import { TeamInboxService } from '../services/team.inbox.service';

@Injectable()
export class MarkAsReadJob extends CommonJob {
  protected priority: number = 10;
  protected noDuplicate: boolean = true;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly sqlService: SqlService,
    protected readonly teamInboxService: TeamInboxService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService
  ) {
    super('c85f33233dc7fb0e735430ecd00c41cc');
  }

  async handle(teamInboxId: number) {
    const inbox = await TeamInboxEntity.first(teamInboxId, { relations: ['contact'] });
    if (!inbox.attributes?.unread_count) return;

    const { mobile, dialing_code } = inbox.contact;

    const sql = `SELECT id, message_id FROM bz_broadcast_messages a WHERE a.deleted_at IS NULL AND a.is_replied=true and a.read_at is NULL and a.business_id=${inbox.business_id} and mobile='${mobile}' and a.dialing_code = ${dialing_code}`;
    const messages = await this.sqlService.read(sql);
    if (!messages?.length) return;

    for (const message of messages) {
      if (!message?.message_id) continue;
      await this.facebookInternalMessageService.markMessageAsRead(message?.message_id, inbox.business_id, {
        source_id: message.id,
        source_type: SourceHash.BroadcastMessages,
      });
    }

    const update = `
      UPDATE bz_broadcast_messages
      SET  read_at = NOW()
      WHERE deleted_at IS NULL AND is_replied=true and read_at is NULL and business_id=${inbox.business_id} and mobile='${mobile}' and dialing_code = ${dialing_code}`;

    await this.sqlService.sql(update);

    inbox.attributes = { ...inbox?.attributes, unread_count: 0 };
    return inbox.save();
  }
}
