import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, SqlService } from '@servicelabsco/nestjs-utility-services';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';

@Injectable()
export class SetTeamInboxStatusJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly sqlService: SqlService
  ) {
    super('17f48023726e1e41cb414adc16a071c9');
  }

  /**
   * Handles the job execution to set expired status for inactive team inboxes
   * @returns {Promise<void>}
   * @description This method finds team inboxes that haven't been active for 20 hours
   * and marks them as expired by setting the expired_at field
   */
  async handle(): Promise<void> {
    // Format the SQL query for better readability and consistency
    const sql = `
      SELECT
        t.id,
        MAX(m.created_at) AS last_customer_reply
      FROM
        bz_broadcast_messages m
        LEFT JOIN bz_contact_details c
          ON c.business_id = m.business_id
          AND c.dialing_code = m.dialing_code
          AND c.mobile = m.mobile
          AND c.deleted_at IS NULL
        LEFT JOIN bz_team_inbox t
          ON t.contact_id = c.id
          AND t.business_id = c.business_id
          AND t.deleted_at IS NULL
      WHERE
        m.is_replied = TRUE
        AND m.deleted_at IS NULL
        AND t.expired_at IS NULL
        AND t.id IS NOT NULL
      GROUP BY
        t.id
      HAVING
        MAX(m.created_at) < NOW() - INTERVAL '24 hours'
    `;

    const messages = await this.sqlService.read(sql);
    if (!messages?.length) return;

    for (const message of messages) {
      const inbox = await TeamInboxEntity.first(message.id);

      inbox.expired_at = new Date();
      inbox.status_id = null;
      inbox.only_broadcast = false;

      const contact = await ContactEntity.first(inbox.contact_id);
      contact.is_assigned_to_bot = true;
      await contact.save();

      await inbox.save();
    }
  }
}
