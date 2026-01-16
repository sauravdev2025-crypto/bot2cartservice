import { Injectable } from '@nestjs/common';
import { Auth, CacheService, SqlService } from '@servicelabsco/nestjs-utility-services';
import SourceHash from '../../config/source.hash';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { SendTeamInboxMessagePayloadDto, SendTeamInboxSimpleMessagePayloadDto } from '../dtos/send.team.inbox.message.payload.dto';
import { TeamInboxListFilterDto } from '../dtos/team.inbox.list.filter.dto';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { BusinessEntity } from '../entities/business.entity';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { TeamInboxStatusTypeEnum } from '../enums/team.inbox.status.type.enum';
import { ProcessSendTeamInboxMessage } from '../libraries/process.send.team.inbox.message';
import { ContactService } from './contact.service';
import { FacebookInternalMessageService } from './facebook.internal.message.service';
import { FacebookInternalService } from './facebook.internal.service';
/**
 * Service for handling team inbox operations including sending messages, managing broadcast messages,
 * and tracking message statuses.
 * @Injectable Marks the class as a provider that can be injected into other classes
 */
@Injectable()
export class TeamInboxService {
  /**
   * Constructs the TeamInboxService with required dependencies
   * @param facebookInternalService Service for handling Facebook internal messaging operations
   * @param sqlService Service for executing SQL queries
   */
  constructor(
    protected readonly facebookInternalService: FacebookInternalService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService,
    protected readonly sqlService: SqlService,
    protected readonly cacheService: CacheService,
    protected readonly contactService: ContactService
  ) {}

  /**
   * Sends a simple message through the team inbox
   * @param teamInboxId The ID of the team inbox to send from
   * @param body The message payload containing content and attachments
   * @returns Promise resolving to the created broadcast message
   */
  public async sendSimpleMessage(teamInboxId: number, body: SendTeamInboxSimpleMessagePayloadDto) {
    const teamIbox = await TeamInboxEntity.first(teamInboxId, { relations: ['contact'] });
    if (!teamIbox) return;

    const to = teamIbox?.contact.wa_id || `${teamIbox?.contact.dialing_code}${teamIbox?.contact?.mobile}`;
    const payload = {
      to,
      ...this.getNormalMessageCommonPayload(body),
    };

    const message = await this.setBroadCastMessage(teamIbox, payload);
    await this.facebookInternalMessageService.sendViaHttps(message?.id);

    return message;
  }

  public async sendTemplateMessage(business_id: number, body: SendTeamInboxMessagePayloadDto) {
    const business = await BusinessEntity.first(business_id);
    return new ProcessSendTeamInboxMessage(business, this.businessMetaIntegrationService, this.facebookInternalMessageService).send(body);
  }

  /**
   * Creates and saves a broadcast message for the team inbox
   * @param teamInboxId The ID of the team inbox
   * @param payload The message payload to broadcast
   * @returns Promise resolving to the saved broadcast message entity
   */
  async setBroadCastMessage(teamIbox: TeamInboxEntity, payload: any) {
    const broadcast = BroadcastMessageEntity.create({});

    broadcast.source_type = SourceHash.TeamInbox;
    broadcast.source_id = teamIbox.id;

    broadcast.business_id = teamIbox.business_id;
    broadcast.mobile = teamIbox.contact.mobile;
    broadcast.dialing_code = teamIbox.contact.dialing_code;

    broadcast.attributes = {
      sent_by: Auth?.user()?.id,
      is_bot: true,
    };

    broadcast.is_replied = false;
    broadcast.payload = payload;

    return broadcast.save();
  }

  async sendBotMessage(teamInbox: TeamInboxEntity, payload: any) {
    const message = await this.setBroadCastMessage(teamInbox, payload);
    await this.facebookInternalMessageService.sendQueueBroadcastMessage(message);
    return message;
  }

  /**
   * Creates and saves a broadcast message for the team inbox
   * @param teamInboxId The ID of the team inbox
   * @param payload The message payload to broadcast
   * @returns Promise resolving to the saved broadcast message entity
   */
  async setInboxLogs(teamInboxId: number, message: any) {
    const teamIbox = await TeamInboxEntity.first(teamInboxId, { relations: ['contact'] });
    if (!teamIbox) return;

    const broadcast = BroadcastMessageEntity.create({});

    broadcast.source_type = SourceHash.TeamInbox;
    broadcast.source_id = teamInboxId;

    broadcast.is_log = true;
    broadcast.from_external_source = true;
    broadcast.business_id = teamIbox.business_id;

    broadcast.mobile = teamIbox.contact.mobile;
    broadcast.dialing_code = teamIbox.contact.dialing_code;

    broadcast.is_replied = false;
    broadcast.payload = {
      message,
    };

    return broadcast.save();
  }

  /**
   * Retrieves the team inbox associated with a broadcast message
   * @param broadcast_message_id - The ID of the broadcast message to find the team inbox for
   * @returns Promise resolving to the team inbox entity if found, otherwise undefined
   * @example
   * const teamInbox = await getTeamInboxFromBroadcastMessage(123);
   */
  async getTeamInboxFromBroadcastMessage(broadcast_message_id: number) {
    const broadcastMessage = await BroadcastMessageEntity.first(broadcast_message_id);
    const contact = await ContactEntity.findOne({
      where: { mobile: broadcastMessage?.mobile, dialing_code: broadcastMessage?.dialing_code, business_id: broadcastMessage?.business_id },
    });

    if (!contact) return;

    const teamInbox = await TeamInboxEntity.findOne({
      where: { contact_id: contact.id, business_id: broadcastMessage?.business_id },
      relations: ['contact', 'business'],
    });
    if (!teamInbox) return;

    return teamInbox;
  }

  async getInboxFromCache(broadcast_message_id: number) {
    const { mobile, dialing_code, business_id } = await BroadcastMessageEntity.first(broadcast_message_id);
    const contact = await this.contactService.getContactFromCache(mobile, dialing_code, business_id);
    if (!contact) return;
    return this.contactService.getInboxFromCache(contact.id);
  }

  /**
   * Marks a broadcast message as read
   * @param broadcast_message_id The ID of the broadcast message to mark as read
   * @returns Promise resolving to the updated broadcast message entity
   */
  async markMessageAsRead(broadcast_message_id: BroadcastMessageEntity['id']) {
    const broadcast = await BroadcastMessageEntity.first(broadcast_message_id);
    if (!broadcast?.is_replied || broadcast?.read_at || broadcast?.is_error) return;

    broadcast.read_at = new Date();
    return broadcast.save();
  }

  /**
   * Constructs the common payload structure for normal messages
   * @param body The message payload containing content and media
   * @returns Object containing the formatted message payload
   */
  getNormalMessageCommonPayload(body: SendTeamInboxSimpleMessagePayloadDto) {
    const payloads = this.getMediaPayload(body);

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      ...payloads,
    };

    return payload;
  }

  /**
   * Determines the appropriate media payload structure based on message content
   * @param body The message payload containing content and media
   * @returns Object containing the formatted media payload
   */
  getMediaPayload(body: SendTeamInboxSimpleMessagePayloadDto) {
    const attachment = body?.attachment;
    const type = attachment?.type as string;

    if (type?.startsWith('application') || type?.startsWith('text'))
      return {
        type: 'document',
        document: {
          link: attachment?.link,
          caption: body?.data,
          filename: attachment?.name,
        },
      };

    if (type?.startsWith('image'))
      return {
        type: 'image',
        image: {
          link: attachment?.link,
          caption: body?.data,
        },
      };

    if (type?.startsWith('video'))
      return {
        type: 'video',
        video: {
          link: attachment?.link,
          caption: body?.data,
        },
      };

    if (type?.startsWith('audio'))
      return {
        type: 'audio',
        audio: {
          link: attachment?.link,
        },
      };

    if (body?.sticker)
      return {
        type: 'sticker',
        sticker: {
          id: body?.sticker,
        },
      };

    return {
      type: 'text',
      text: {
        body: body?.data,
      },
    };
  }

  public getSanitizedFilter(filter: TeamInboxListFilterDto) {
    const filterCopy = filter;

    if (Array.isArray(filterCopy?.status_ids)) {
      if (filterCopy.status_ids.includes(TeamInboxStatusTypeEnum.EXPIRED)) {
        filterCopy.is_expired = true;
      }
      if (filterCopy.status_ids.includes(TeamInboxStatusTypeEnum.ONLY_BROADCAST)) {
        filterCopy.active_chat = true;
      }
      // Remove the handled status types from status_ids
      filterCopy.status_ids = filterCopy.status_ids.filter(
        (id) => id !== TeamInboxStatusTypeEnum.EXPIRED && id !== TeamInboxStatusTypeEnum.ONLY_BROADCAST
      );
      // If status_ids is empty after filtering, remove it
      if (filterCopy.status_ids.length === 0) {
        delete filterCopy.status_ids;
      }
    }

    return filterCopy;
  }
}
