import { WebhookEventsConstants } from '../../config/webhook.event.constants';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { WebhookService } from '../services/webhook.service';

export class ProcessSendWebhookEvent {
  protected broadcastMessage: BroadcastMessageEntity;

  constructor(protected readonly webhookService: WebhookService) {}

  async process(id: number, event: WebhookEventsConstants) {
    this.broadcastMessage = await BroadcastMessageEntity.first(id);
    if (event === WebhookEventsConstants?.MESSAGE_RECEIVED) await this.sendMessageReceived();
  }

  private async sendMessageReceived() {
    await this.webhookService.triggerEvent(this.broadcastMessage.business_id, {
      event_identifier: WebhookEventsConstants.MESSAGE_RECEIVED,
      payload: this.broadcastMessage,
    });
  }
}
