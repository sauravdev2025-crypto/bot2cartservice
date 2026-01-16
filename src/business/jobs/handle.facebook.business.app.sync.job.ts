import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { TemplateUtil } from '../../common/template.util';
import SourceHash from '../../config/source.hash';
import { WebhookEventsConstants } from '../../config/webhook.event.constants';
import { FacebookInternalLogEntity } from '../../utility/entities/facebook.internal.log.entity';
import {
  AppStateSyncData,
  BusinessAppWebhookChange,
  BusinessAppWebhookEventDto,
  HistorySyncData,
  MessageEchoData,
} from '../dtos/handle.facebook.business.app.sync.dto';
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
export class HandleFacebookBusinessAppSyncJob extends CommonJob {
  protected readonly priority: number = 3;
  protected timeout = 60000;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly businessAccessService: BusinessAccessService,
    protected readonly teamInboxService: TeamInboxService,
    protected readonly messageGateway: MessageGateway,
    protected readonly webhookService: WebhookService
  ) {
    super('d8fcee06a3fe8bfca0d7afbc790d6f73');
  }
  async handle(rawData: BusinessAppWebhookEventDto) {
    for (const entry of rawData.entry) {
      const business = await this.businessAccessService.getBusinessFromIdentifier(entry.id);
      if (!business) continue;

      for (const change of entry.changes) {
        await this.routeWebhookEvent(change, business, rawData);
      }
    }

    const changeTypes = Array.from(new Set(rawData.entry.flatMap((e) => e.changes?.map((c) => c.field) ?? [])));

    const log = FacebookInternalLogEntity.create({
      source_id: 9999,
      source_type: changeTypes.length ? `sync-chat:${changeTypes.join(',')}` : 'sync-chat',
      response: rawData,
    });
    await log.save();
  }

  private async routeWebhookEvent(change: BusinessAppWebhookChange, business: BusinessEntity, rawData: BusinessAppWebhookEventDto) {
    switch (change.field) {
      case 'history':
        await this.handleHistorySync(change.value as HistorySyncData, business, rawData);
        break;
      case 'smb_app_state_sync':
        await this.handleContactSync(change.value as AppStateSyncData, business, rawData);
        break;
      case 'smb_message_echoes':
        await this.handleMessageEchoes(change.value as MessageEchoData, business, rawData);
        break;
      default:
        this.logger.warn(`[HandleFacebookBusinessAppSyncJob] Unhandled business app sync field: ${change.field}`);
    }
  }

  /**
   * Handle chat history synchronization
   * Syncs messages from the last 6 months from WhatsApp Business app
   */
  private async handleHistorySync(data: HistorySyncData, business: BusinessEntity, rawData: BusinessAppWebhookEventDto) {
    this.logger.log(`[HandleFacebookBusinessAppSyncJob] Processing history sync for business ${business.id}`);

    const history = data?.history ?? [];

    // Helper to process a single message within an optional thread context
    const processMessage = async (message: any, threadId?: string) => {
      try {
        // Determine direction
        const isSentByMe = message?.history_context?.from_me ?? message?.from === data?.metadata?.display_phone_number;

        const contact = await this.createOrUpdateContact(threadId, business.id, 'history', {
          full_name: threadId,
        });

        if (!contact) return;

        // Create team inbox if it doesn't exist
        const teamInbox = await TeamInboxEntity.firstOrCreate({
          contact_id: contact.id,
          business_id: business.id,
        });

        if (message?.history_context?.status === 'read') return;
        if (message?.history_context?.status === 'pending') return;

        // Check if message already exists (avoid duplicates)
        const existingMessage = await BroadcastMessageEntity.findOne({
          where: { message_id: message.id, business_id: business.id },
        });

        if (existingMessage) return;

        // Create message record
        const broadcastMessage = BroadcastMessageEntity.create({
          source_type: SourceHash.TeamInbox,
          source_id: teamInbox.id,
          business_id: business.id,
          message_id: message.id,
          dialing_code: contact.dialing_code,
          mobile: contact.mobile,
          payload: message,
          webhook_response: rawData,
          is_replied: isSentByMe ? false : true, // incoming history messages are considered "replied"
          created_at: new Date(parseInt(message.timestamp) * 1000),
          updated_at: new Date(parseInt(message.timestamp) * 1000),
          sent_at: new Date(parseInt(message.timestamp) * 1000),
          delivered_at: new Date(parseInt(message.timestamp) * 1000),
          from_external_source: isSentByMe ? true : false,
          attributes: {
            ...message,
            sync_type: 'history',
            sync_timestamp: new Date().toISOString(),
            history_context: message?.history_context,
            is_system_synced: true,
            custom_name: 'Business App',
          },
        });

        await broadcastMessage.save();

        // Update team inbox
        teamInbox.active = true;
        teamInbox.status_id = TeamInboxStatusTypeEnum.OPEN;
        teamInbox.only_broadcast = true;
        teamInbox.last_activity_at = new Date(parseInt(message.timestamp) * 1000);

        await teamInbox.save();
      } catch (error) {
        this.logger.error(`[HandleFacebookBusinessAppSyncJob] Error processing history message ${message?.id}:`, error);
      }
    };

    // Support both new (threaded) and legacy (flat) shapes
    for (const item of history) {
      const hasThreads = Array.isArray(item?.threads);
      if (hasThreads) {
        for (const thread of item.threads || []) {
          const threadId = thread?.id;
          for (const message of thread?.messages || []) {
            await processMessage(message, threadId);
          }
        }
      } else {
        // Legacy flat message entry
        await processMessage(item, undefined);
      }
    }

    const rawMessages = data?.messages;
    if (!rawMessages?.length) return;

    for (const message of rawMessages) {
      if (!message?.from) continue;
      await processMessage(message, message?.from);
    }
  }

  /**
   * Handle contact synchronization
   * Syncs contact information from WhatsApp Business app
   */
  private async handleContactSync(data: AppStateSyncData, business: BusinessEntity, rawData: BusinessAppWebhookEventDto) {
    this.logger.log(`[HandleFacebookBusinessAppSyncJob] Processing contact sync for business ${business.id}`);

    for (const contactData of data.state_sync || []) {
      try {
        if (contactData.action === 'remove') {
          // Handle contact removal
          const contact = await ContactEntity.findOne({
            where: {
              business_id: business.id,
              wa_id: contactData.contact.phone_number,
            },
          });

          if (contact) {
            contact.active = false;
            contact.attributes = {
              ...contact.attributes,
              removed_at: new Date().toISOString(),
              removed_by: 'whatsapp_business_app',
            };

            const inbox = await TeamInboxEntity.findOne({ where: { business_id: business.id, contact_id: contact.id } });
            if (inbox) await inbox.softDelete();

            await contact.save();
            await contact.softDelete();
          }
        } else {
          await this.createOrUpdateContact(contactData.contact.phone_number, business.id, 'contact_sync', {
            full_name: contactData.contact.full_name,
          });
        }
      } catch (error) {
        this.logger.error(`[HandleFacebookBusinessAppSyncJob] Error processing contact sync:`, error);
      }
    }
  }

  private async handleMessageEchoes(data: MessageEchoData, business: BusinessEntity, rawData: BusinessAppWebhookEventDto) {
    this.logger.log(`[HandleFacebookBusinessAppSyncJob] Processing message echoes for business ${business.id}`);

    for (const messageEcho of data.message_echoes || []) {
      try {
        // Create or find contact
        const contact = await this.createOrUpdateContact(messageEcho.to, business.id, 'message_echo');
        if (!contact) continue;

        // Create team inbox if it doesn't exist
        const teamInbox = await TeamInboxEntity.firstOrCreate({
          contact_id: contact.id,
          business_id: business.id,
        });

        // Check if message already exists (avoid duplicates)
        const existingMessage = await BroadcastMessageEntity.findOne({
          where: { message_id: messageEcho.id, business_id: business.id },
        });

        if (existingMessage) continue;

        const isSentByMyBusiness = business.internal_number === data.metadata.phone_number_id;

        // Create message record
        const broadcastMessage = BroadcastMessageEntity.create({
          source_type: SourceHash.TeamInbox,
          source_id: teamInbox.id,
          business_id: business.id,
          message_id: messageEcho.id,
          dialing_code: contact.dialing_code,
          mobile: contact.mobile,
          payload: messageEcho,
          webhook_response: rawData,
          is_replied: isSentByMyBusiness ? false : true,
          sent_at: new Date(parseInt(messageEcho.timestamp) * 1000),
          delivered_at: new Date(parseInt(messageEcho.timestamp) * 1000),
          from_external_source: true,
          attributes: {
            ...messageEcho,
            sync_type: 'message_echo',
            sync_timestamp: new Date().toISOString(),
            echo_source: 'whatsapp_business_app',
            is_system_synced: true, // Move this to attributes instead
            custom_name: 'Business Application',
          },
        });

        await broadcastMessage.save();

        // Update team inbox
        teamInbox.active = true;
        teamInbox.status_id = TeamInboxStatusTypeEnum.OPEN;
        teamInbox.attributes = {
          ...teamInbox.attributes,
          unread_count: (teamInbox.attributes?.unread_count || 0) + (isSentByMyBusiness ? 0 : 1),
        };
        await teamInbox.save();

        // Send real-time event
        await this.messageGateway.pushToInbox(teamInbox.id, {
          event: WebhookEventsConstants.MESSAGE_RECEIVED,
          inbox_id: teamInbox.id,
        });

        // Trigger webhook event
        await this.webhookService.triggerEvent(business.id, {
          event_identifier: WebhookEventsConstants.MESSAGE_RECEIVED,
          payload: { ...rawData, dart_message_id: broadcastMessage?.uuid },
        });
      } catch (error) {
        this.logger.error(`[HandleFacebookBusinessAppSyncJob] Error processing message echo ${messageEcho.id}:`, error);
      }
    }
  }

  /**
   * Helper method to create or update contacts
   */
  private async createOrUpdateContact(
    waId: string,
    businessId: number,
    source: string,
    additionalData?: { full_name?: string; first_name?: string }
  ): Promise<ContactEntity | null> {
    try {
      const { dialing_code, mobile } = TemplateUtil.getDialingCodeFromMobile(waId);

      const contact = await ContactEntity.firstOrCreate({
        business_id: businessId,
        mobile,
        wa_id: waId,
      });

      if (!contact.validated_at || additionalData) {
        // Update contact information if not validated or if we have new data
        contact.validated_at = new Date();
        contact.mobile = mobile;
        contact.dialing_code = Number(dialing_code.trim());
        contact.is_system_generated = !contact.created_by;

        if (additionalData?.full_name) {
          contact.name = additionalData?.full_name;
          contact.display_name = contact?.display_name || additionalData?.full_name;
        }

        contact.attributes = {
          ...contact.attributes,
          sync_source: source,
          last_synced: new Date().toISOString(),
        };

        contact.is_assigned_to_bot = true;
      }

      return contact.save();
    } catch (error) {
      this.logger.error(`[HandleFacebookBusinessAppSyncJob] Error creating/updating contact for ${waId}:`, error);
      return null;
    }
  }
}
