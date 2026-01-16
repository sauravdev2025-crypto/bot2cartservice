import { Injectable } from '@nestjs/common';
import { CacheService, CommonJob, DatabaseEventDto, PropertyService, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity } from '@servicelabsco/slabs-access-manager';
import { LocalSqsService } from '../../utility/services/local.sqs.service';
import { SendFcmNotification } from '../../utility/services/send.fcm.notification';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { TeamInboxService } from '../services/team.inbox.service';

@Injectable()
export class SendPushNotificationJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    private readonly propertyService: PropertyService,
    private readonly cacheService: CacheService,
    protected readonly teamInboxService: TeamInboxService,
    protected readonly localSqsService: LocalSqsService
  ) {
    super('c22809018dd7301d5d454e05bf7d5d96');
  }

  async handle(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    await this.sendPushNotification(evt);
  }

  async sendPushNotification(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    if (!this.isNewRecord(evt)) return;
    if (!evt.entity.is_replied) return;

    if (evt.entity.read_at) return;

    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(evt.entity?.id);
    if (!teamInbox) return;

    if (!teamInbox?.assignee_id) return this.sendPushNotificationToAll(teamInbox);

    const businessUser = await BusinessUserEntity.first(teamInbox?.assignee_id, { relations: ['business'] });
    if (!businessUser) return;

    await this.send([businessUser?.user_id], teamInbox);
  }

  /**
   * Sends push notifications to all active business users for a given team inbox
   * @param teamIbox - The team inbox entity to notify about
   * @returns Promise that resolves when notifications are sent
   */
  async sendPushNotificationToAll(teamIbox: TeamInboxEntity) {
    const businessUser = await BusinessUserEntity.find({ where: { business_id: teamIbox.business_id, active: true } });
    if (!businessUser?.length) return;

    const userIds = businessUser.map((_bu) => _bu.user_id);
    await this.send(userIds, teamIbox);
  }

  /**
   * Sends push notifications to specific users about a team inbox message
   * @param user_ids - Array of user IDs to notify
   * @param teamInbox - The team inbox entity containing message details
   * @returns Promise that resolves when notifications are sent
   */
  async send(user_ids: number[], teamInbox: TeamInboxEntity) {
    const senderName = teamInbox?.contact?.name || teamInbox?.contact?.display_name || teamInbox?.contact?.wa_id || 'New user';

    await new SendFcmNotification(this.propertyService, this.localSqsService, this.cacheService).process({
      business: teamInbox.business,
      user_ids,
      data: {
        notification: {
          title: `New Message Received!`,
          body: `${senderName} sent a message.`,
        },
        data: {
          team_inbox_id: `${teamInbox?.id}`,
        },
      },
      identifier: 'message_received',
    });
  }
}
