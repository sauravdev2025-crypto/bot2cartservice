import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { WebhookEventsConstants } from '../../config/webhook.event.constants';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { WebhookService } from '../services/webhook.service';

@Injectable()
export class ProcessBroadcastMessageResponseJob extends CommonJob {
  protected priority = 1;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly webhookService: WebhookService
  ) {
    super('178ca9de769e96ee97d72d9762372d53');
  }

  async handle(payload: any) {
    const broadcastMessage = await BroadcastMessageEntity.first(payload?.identifier || payload?.metadata?.message_id);
    if (!broadcastMessage) return;

    const body = JSON.parse(payload?.response?.body);

    broadcastMessage.is_error = !payload?.success;
    broadcastMessage.active = payload?.success;

    broadcastMessage.response = body;
    broadcastMessage.message_id = body?.messages?.[0]?.id;

    await broadcastMessage.save();

    if (broadcastMessage?.is_error) {
      await this.webhookService.triggerEvent(broadcastMessage.business_id, {
        payload: { ...body, dart_message_id: broadcastMessage?.uuid },
        event_identifier: WebhookEventsConstants.MESSAGE_ERROR,
      });
    }
  }
}
