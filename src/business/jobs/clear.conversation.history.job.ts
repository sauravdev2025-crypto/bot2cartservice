// Create new file: src/business/jobs/clear.conversation.history.job.ts

import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, SqlService } from '@servicelabsco/nestjs-utility-services';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxService } from '../services/team.inbox.service';
import { TeamInboxEntity } from '../entities/team.inbox.entity';

@Injectable()
export class ClearConversationHistoryJob extends CommonJob {
  protected priority: number = 15;
  protected noDuplicate: boolean = true;
  protected timeout: number = 30000; // 30 seconds timeout

  constructor(
    protected readonly queueService: QueueService,
    protected readonly sqlService: SqlService,
    protected readonly teamInboxService: TeamInboxService
  ) {
    super('45309e1298a33f558708f9937538d3f7');
  }

  async handle(contactId: number) {
    const contact = await ContactEntity.first(contactId, { relations: ['business'] });
    if (!contact) throw new Error(`Contact with ID ${contactId} not found`);

    const teamInbox = await TeamInboxEntity.findOne({ where: { business_id: contact.business_id, contact_id: contact.id } });
    if (!teamInbox) return;

    const { mobile, dialing_code, business_id } = contact;

    // Soft delete all messages for this contact
    const updateQuery = `
      UPDATE bz_broadcast_messages 
      SET deleted_at = NOW() 
      WHERE deleted_at IS NULL 
        AND business_id = ${business_id} 
        AND mobile = '${mobile}' 
        AND dialing_code = ${dialing_code}
    `;

    await this.sqlService.sql(updateQuery);
    await this.teamInboxService.setInboxLogs(
      teamInbox.id,
      `Conversation history was successfully cleared via the API. All previous messages associated with this contact have been deleted as requested.`
    );
  }
}
