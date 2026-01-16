import { Injectable } from '@nestjs/common';
import { CommonJob, PropertyService, QueueService, RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import { FacebookWebhookEventDto } from '../dtos/facebook.webhook.event.dto';
import { HandleFacebookApprovalJob } from './handle.facebook.approval.job';
import { HandleFacebookBusinessAppSyncJob } from './handle.facebook.business.app.sync.job';
import { HandleFacebookMessagesJob } from './handle.facebook.messages.job';
import { HandleWhatsappBusinessAccountJob } from './handle.whatsapp.business.account.job';

@Injectable()
export class HandleFacebookWebhookJob extends CommonJob {
  /** Priority level of the job (higher number = higher priority) */
  protected priority: number = 1;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly handleFacebookApprovalJob: HandleFacebookApprovalJob,
    protected readonly handleFacebookMessagesJob: HandleFacebookMessagesJob,
    protected readonly handleFacebookBusinessAppSyncJob: HandleFacebookBusinessAppSyncJob,
    protected readonly handleWhatsAppBusinessAccountJob: HandleWhatsappBusinessAccountJob,
    protected readonly propertyService: PropertyService,
    protected readonly remoteRequestService: RemoteRequestService
  ) {
    super('accda1252c05432958e581906d1675a2');
  }

  async handle(rawData: FacebookWebhookEventDto) {
    await this.handleFacebookApprovalJob.dispatch(rawData);
    await this.handleFacebookMessagesJob.dispatch(rawData);

    if (this.hasBusinessAppSyncChange(rawData)) await this.handleFacebookBusinessAppSyncJob.dispatch(rawData);
    if (this.hasWhatsAppBusinessAccountUpdateChange(rawData)) await this.handleWhatsAppBusinessAccountJob.dispatch(rawData);
  }

  /**
   * Checks for business app sync changes in the webhook event.
   */
  private hasBusinessAppSyncChange(rawData: FacebookWebhookEventDto): boolean {
    return (
      rawData.entry?.some((entry) =>
        entry.changes?.some((change) => ['history', 'smb_app_state_sync', 'smb_message_echoes'].includes(change.field))
      ) ?? false
    );
  }

  /**
   * Checks for WhatsApp business account update changes in the webhook event.
   */
  private hasWhatsAppBusinessAccountUpdateChange(rawData: FacebookWebhookEventDto): boolean {
    return rawData.entry?.some((entry) => entry.changes?.some((change) => change.field === 'account_update')) ?? false;
  }
}
