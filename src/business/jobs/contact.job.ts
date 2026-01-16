import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { TeamInboxService } from '../services/team.inbox.service';

@Injectable()
export class ContactJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly teamInboxService: TeamInboxService
  ) {
    super('a1c043589bf0b7d056fb51cc9672c03d');
  }
  async handle(evt: DatabaseEventDto<ContactEntity>) {
    await this.handleSyncContactAndInbox(evt);
    await this.setBotAssignLog(evt);

    return evt.entity;
  }

  async handleSyncContactAndInbox(evt: DatabaseEventDto<ContactEntity>) {
    if (!this.isColumnUpdated(evt, ['managed_by'])) return;

    const inbox = await TeamInboxEntity.findOne({ where: { business_id: evt.entity.business_id, contact_id: evt.entity.id } });
    if (!inbox) return;
    if (inbox.assignee_id === evt.entity.managed_by) return;

    inbox.assignee_id = evt.entity.managed_by;
    return inbox.save();
  }

  async setBotAssignLog(evt: DatabaseEventDto<ContactEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['is_assigned_to_bot'])) return;

    if (evt.entity.is_assigned_to_bot) {
      const inbox = await TeamInboxEntity.findOne({ where: { business_id: evt.entity.business_id, contact_id: evt.entity.id } });
      await this.teamInboxService.setInboxLogs(inbox.id, `Bot Mode has been enabled for this contact.`);
    }
  }
}
