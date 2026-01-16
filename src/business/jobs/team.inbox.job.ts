import { Injectable } from '@nestjs/common';
import { CacheService, CommonJob, DatabaseEventDto, PropertyService, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity } from '@servicelabsco/slabs-access-manager';
import { LocalSqsService } from '../../utility/services/local.sqs.service';
import { SendFcmNotification } from '../../utility/services/send.fcm.notification';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { BusinessSettingsService } from '../services/business.settings.service';
import { TeamInboxService } from '../services/team.inbox.service';

@Injectable()
export class TeamInboxJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    private readonly propertyService: PropertyService,
    private readonly cacheService: CacheService,
    protected readonly teamInboxService: TeamInboxService,
    protected readonly localSqsService: LocalSqsService
  ) {
    super('9eec356b604480b734bdc23bedc6f80d');
  }
  async handle(evt: DatabaseEventDto<TeamInboxEntity>) {
    await this.handleSyncContactAndInbox(evt);
    return evt.entity;
  }

  async handleSyncContactAndInbox(evt: DatabaseEventDto<TeamInboxEntity>) {
    if (!this.isColumnUpdated(evt, ['assignee_id'])) return;

    if (evt?.entity?.assignee_id) {
      const user = await BusinessUserEntity.findOne({ where: { id: evt.entity.assignee_id }, relations: ['user'] });
      if (user) {
        await this.teamInboxService.setInboxLogs(evt.entity.id, `Chat has been assigned to the ${user?.user?.name}`);
        await this.notifyOnAssign([user?.user_id], evt.entity);
      }
    }

    const contact = await ContactEntity.first(evt.entity.contact_id);

    if (contact.managed_by === evt.entity.assignee_id) return contact.save();

    contact.managed_by = evt.entity.assignee_id;
    return contact.save();
  }

  async notifyOnAssign(user_ids: number[], teamInbox: TeamInboxEntity) {
    const inbox = await TeamInboxEntity.first(teamInbox.id, { relations: ['contact', 'business'] });
    const senderName = inbox?.contact?.name || inbox?.contact?.display_name || inbox?.contact?.wa_id || 'New user';

    await new SendFcmNotification(this.propertyService, this.localSqsService, this.cacheService).process({
      business: inbox.business,
      user_ids,
      data: {
        notification: {
          title: `Inbox has been assigned to you..`,
          body: `${senderName} chat has been assigned to you`,
        },
        data: {
          team_inbox_id: `${teamInbox?.id}`,
        },
      },
      identifier: 'message_received',
    });
  }
}
