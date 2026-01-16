import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';

import { TemplateUtil } from '../../common/template.util';
import SourceHash from '../../config/source.hash';
import { WebhookEventsConstants } from '../../config/webhook.event.constants';
import { FaceBookMessageChangeDto, FacebookMessageRepliedDto, FacebookWebhookEventDto } from '../dtos/facebook.webhook.event.dto';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { BusinessEntity } from '../entities/business.entity';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { TeamInboxStatusTypeEnum } from '../enums/team.inbox.status.type.enum';
import { BusinessAccessService } from '../services/business.access.service';
import { MessageGateway } from '../services/message.gateway';
import { TeamInboxService } from '../services/team.inbox.service';
import { WebhookService } from '../services/webhook.service';

@Injectable()
export class HandleFacebookMessagesJob extends CommonJob {
  protected readonly priority: number = 5;
  protected timeout = 60000;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly businessAccessService: BusinessAccessService,
    protected readonly webhookService: WebhookService,
    protected readonly teamInboxService: TeamInboxService,
    protected readonly messageGateway: MessageGateway
  ) {
    super('a36a370a3ba14e9164a025913467c2de');
  }

  async handle(rawData: FacebookWebhookEventDto) {
    for (const _data of rawData.entry) {
      const business = await this.businessAccessService.getBusinessFromIdentifier(_data.id);
      if (!business) continue;

      for (const change of _data?.changes as FaceBookMessageChangeDto[]) {
        await this.handleMessageStatus(change, rawData);
        await this.handleNewMessage(change, rawData, business);
      }
    }
  }

  async handleMessageStatus(change: FaceBookMessageChangeDto, raw: FacebookWebhookEventDto) {
    if (!change?.value?.statuses?.length) return;

    for (const status of change?.value?.statuses) {
      if (!status?.id) continue;

      const source = await BroadcastMessageEntity.findOne({ where: { message_id: status.id } });
      if (!source) continue;

      if (status.status === 'sent') source.sent_at = new Date();
      if (status.status === 'delivered') source.delivered_at = new Date();
      if (status.status === 'read') source.read_at = new Date();

      if (status.status === 'failed') {
        source.is_error = true;
        source.attributes = { ...source.attributes, errors: (status as any)?.errors };
      }

      source.webhook_response = { ...source.webhook_response, [status?.status || 'raw']: raw };

      await source.save();
      await this.sendEvent(source.id);
      await this.handleTriggerWebhook(status.status, source);
    }
  }

  async sendEvent(id: number) {
    const inbox = await this.teamInboxService.getInboxFromCache(id);
    return this.messageGateway.pushToInbox(inbox?.id, { event: WebhookEventsConstants.MESSAGE_RECEIVED, inbox_id: inbox?.id });
  }

  async handleTriggerWebhook(status: any, source: BroadcastMessageEntity) {
    if (status === 'sent') {
      return this.webhookService.triggerEvent(source.business_id, {
        event_identifier: WebhookEventsConstants.MESSAGE_SENT,
        payload: { ...source?.webhook_response?.sent, dart_message_id: source?.uuid },
      });
    }
    if (status === 'delivered') {
      return this.webhookService.triggerEvent(source.business_id, {
        event_identifier: WebhookEventsConstants.MESSAGE_DELIVERED,
        payload: { ...source.webhook_response?.delivered, dart_message_id: source?.uuid },
      });
    }
    if (status === 'read') {
      return this.webhookService.triggerEvent(source.business_id, {
        event_identifier: WebhookEventsConstants.MESSAGE_READ,
        payload: { ...source.webhook_response?.read, dart_message_id: source?.uuid },
      });
    }

    if (status === 'failed') {
      return this.webhookService.triggerEvent(source.business_id, {
        event_identifier: WebhookEventsConstants.MESSAGE_ERROR,
        payload: { ...source?.webhook_response?.failed, dart_message_id: source?.uuid },
      });
    }

    if (status === 'message-received') {
      const broadcast = await BroadcastMessageEntity.first(source?.id);
      return this.webhookService.triggerEvent(source.business_id, {
        event_identifier: WebhookEventsConstants.MESSAGE_RECEIVED,
        payload: { ...source.payload, dart_message_id: broadcast?.uuid },
      });
    }
  }

  async handleNewMessage(change: FaceBookMessageChangeDto, raw: FacebookWebhookEventDto, business: BusinessEntity) {
    if (!change?.value?.messages?.length) return;

    for (const message of change?.value?.messages) {
      if (message?.type === 'system') {
        await this.handleSystemMessage(message, business.id);
      } else {
        const teamIbox = await this.setTeamInbox(change, business.id);
        if (!teamIbox) continue;

        const data = await this.setMessage(teamIbox, message, raw);
        await this.sendEvent(data.id);
        await this.handleTriggerWebhook('message-received', data);
      }
    }
  }

  async handleSystemMessage(message: FacebookMessageRepliedDto, business_id: number) {
    if (message.system?.type === 'user_changed_number') {
      // system
    }
  }

  async setMessage(teamInbox: TeamInboxEntity, message: FacebookMessageRepliedDto, raw: FacebookWebhookEventDto): Promise<BroadcastMessageEntity> {
    let source: BroadcastMessageEntity;
    if (message?.context?.id) source = await BroadcastMessageEntity.findOne({ where: { message_id: message?.context?.id } });

    const contact = await ContactEntity.first(teamInbox?.contact_id);

    const newMessage = BroadcastMessageEntity.create({});

    newMessage.source_type = SourceHash.TeamInbox;
    newMessage.source_id = teamInbox.id;

    newMessage.business_id = teamInbox.business_id;

    newMessage.sent_at = new Date();
    newMessage.delivered_at = new Date();

    newMessage.is_replied = true;

    newMessage.message_id = message.id;

    newMessage.dialing_code = source?.dialing_code || contact?.dialing_code;
    newMessage.mobile = source?.mobile || contact?.mobile;

    newMessage.payload = message;
    newMessage.webhook_response = raw;

    newMessage.parent_id = source?.id;
    return newMessage.save();
  }

  async setTeamInbox(change: FaceBookMessageChangeDto, business_id: number) {
    const faContact = change.value?.contacts?.[0];
    if (!faContact?.wa_id) return;

    const contact = await ContactEntity.firstOrCreate({ business_id, wa_id: faContact.wa_id });

    if (!contact?.validated_at || !contact?.display_name) {
      const { dialing_code, mobile } = TemplateUtil.getDialingCodeFromMobile(faContact.wa_id);

      contact.validated_at = new Date();
      contact.name = faContact?.profile?.name;

      contact.mobile = mobile;
      contact.dialing_code = Number(dialing_code.trim());

      contact.is_system_generated = contact?.created_by ? false : true;
      contact.display_name = contact?.display_name || faContact?.profile?.name;

      await contact.save();
    }

    const teamIbox = await TeamInboxEntity.firstOrCreate({ contact_id: contact.id, business_id: contact.business_id });
    teamIbox.attributes = { ...(teamIbox?.attributes || {}), unread_count: (teamIbox?.attributes?.unread_count || 0) + 1 };

    if (!teamIbox?.assignee_id && contact?.managed_by) teamIbox.assignee_id = contact.managed_by;
    if (teamIbox?.id) return teamIbox.save();

    teamIbox.active = true;
    teamIbox.status_id = TeamInboxStatusTypeEnum.OPEN;
    teamIbox.only_broadcast = false;

    return teamIbox.save();
  }
}
