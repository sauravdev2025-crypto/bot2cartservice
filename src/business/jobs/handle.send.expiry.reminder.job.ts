import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, SqlService } from '@servicelabsco/nestjs-utility-services';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { TeamInboxService } from '../services/team.inbox.service';

@Injectable()
export class HandleSendExpiryReminderJob extends CommonJob {
  protected priority: number = 20;
  protected noDuplicate: boolean = true;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly teamInboxService: TeamInboxService,
    protected readonly sqlService: SqlService
  ) {
    super('a909dd92b6be8e2db430532e23e4db2a');
  }

  async handle() {
    const sql = `
      SELECT
        business_id,
        user_reminder_preference ->> 'time' AS time,
        user_reminder_preference ->> 'template_id' AS template_id,
        user_reminder_preference ->> 'message' AS message
      FROM
        bz_business_settings
      WHERE
        user_reminder_preference ->> 'time' IS NOT NULL
        AND deleted_at IS NULL
        AND business_id IS NOT NULL
    `;

    const businesses = await this.sqlService.read(sql);
    if (!businesses?.length) return;

    for (const settings of businesses) {
      const businessId = Number(settings?.business_id);
      const minutes = Number(settings?.time);
      if (!Number.isFinite(minutes) || ![15, 30, 45, 60].includes(minutes)) continue;

      const inboxSql = `
        SELECT
          a.id,
          MAX(a.last_replied_at) AS last_replied_at
        FROM
          bz_team_inbox a
        WHERE
          a.deleted_at IS NULL
          AND a.active = TRUE
          AND a.expired_at IS NULL
          AND a.status_id = 2025
          AND a.business_id = ${businessId}
          and COALESCE((a.attributes->>'reminder_sent')::boolean, false) = false
          and a.only_broadcast = false
          and a.last_replied_at is not null
        GROUP BY
          a.id
        HAVING
          MAX(a.last_replied_at) < NOW() - INTERVAL '24 hours' + INTERVAL '${minutes} minutes'
      `;

      const inboxes = await this.sqlService.read(inboxSql);
      if (!inboxes?.length) continue;

      for (const inbox of inboxes) {
        const teamInbox = await TeamInboxEntity.first(inbox.id);
        if (teamInbox?.attributes?.reminder_sent) continue;

        if (settings?.message) {
          await this.teamInboxService.sendSimpleMessage(inbox.id, { data: settings?.message });
          teamInbox.attributes = { ...teamInbox?.attributes, reminder_sent: true };
        }

        if (settings?.template_id) {
          await this.teamInboxService.sendTemplateMessage(businessId, {
            contact_id: inbox.contact_id,
            template_id: settings.template_id,
            custom_attributes: {
              name: inbox?.contact?.name,
            },
          });
          teamInbox.attributes = { ...teamInbox?.attributes, reminder_sent: true };
        }

        await teamInbox.save();
      }
    }
  }
}
