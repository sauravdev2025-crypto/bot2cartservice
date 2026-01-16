import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BroadcastService } from '../../socket/services/broadcast.service';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { TeamInboxService } from '../services/team.inbox.service';

@Injectable()
export class TriggerTeamInboxChatSocketJob extends CommonJob {
  protected priority: number = 1;

  constructor(
    protected readonly queueService: QueueService,
    private readonly broadcastService: BroadcastService,
    protected readonly teamInboxService: TeamInboxService
  ) {
    super('a5bbc30bad35a863f4fb5e1ae7efd31c');
  }

  async handle(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    await this.newMessageReceivedFromUser(evt);
    await this.messageSentStatus(evt);
  }

  async newMessageReceivedFromUser(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    if (!this.isNewRecord(evt)) return;
    if (!evt.entity.is_replied) return;

    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(evt.entity.id);
    await this.broadcastService.newMessagedReceived(evt.entity.business_id, { team_inbox_id: teamInbox.id, payload: teamInbox });
  }

  async messageSentStatus(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(evt.entity.id);
    if (!teamInbox) return;

    await this.broadcastService.updateMessageStatus(evt.entity.business_id, {
      team_inbox_id: teamInbox.id,
      message_id: evt.entity.id,
      message_payload: {
        sent_at: evt.entity.sent_at,
        read_at: evt.entity.read_at,
        delivered_at: evt.entity.delivered_at,
        is_error: evt.entity.is_error,
      },
    });
  }
}
