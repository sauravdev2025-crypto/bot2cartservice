import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { WebhookService } from '../services/webhook.service';

@Injectable()
export class BusinessWebhookEventTriggerJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly webhookService: WebhookService
  ) {
    super('c72593cc969f1871e8fa52361c0b071d');
  }

  async handle(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    // await this.triggerWebhookMessageReceived(evt);
  }

  // private async triggerWebhookMessageReceived(evt: DatabaseEventDto<BroadcastMessageEntity>) {
  //   if (!this.isNewRecord(evt)) return;
  //   if (!evt.entity.is_replied) return;

  //   await this.webhookService.triggerEvent(evt.entity.business_id, {
  //     event_identifier: WebhookEventsConstants.MESSAGE_RECEIVED,
  //     payload: evt.entity.payload,
  //   });
  // }

  // private async triggerMessageDeliveredAt(evt: DatabaseEventDto<BroadcastMessageEntity>) {
  //   if (this.isNewRecord(evt)) return;
  //   if (evt.entity.is_replied) return;

  //   if (!evt.entity.delivered_at) return;

  //   await this.webhookService.triggerEvent(evt.entity.business_id, {
  //     event_identifier: WebhookEventsConstants.MESSAGE_DELIVERED,
  //     payload: evt.entity.webhook_response?.delivered,
  //   });
  // }

  // private async triggerMessageRead(evt: DatabaseEventDto<BroadcastMessageEntity>) {
  //   if (this.isNewRecord(evt)) return;
  //   if (evt.entity.is_replied) return;

  //   if (!evt.entity.read_at) return;

  //   await this.webhookService.triggerEvent(evt.entity.business_id, {
  //     event_identifier: WebhookEventsConstants.MESSAGE_READ,
  //     payload: evt.entity.webhook_response?.read,
  //   });
  // }

  // private async triggerMessageSent(evt: DatabaseEventDto<BroadcastMessageEntity>) {
  //   if (this.isNewRecord(evt)) return;
  //   if (evt.entity.is_replied) return;

  //   if (!evt.entity.sent_at) return;

  //   await this.webhookService.triggerEvent(evt.entity.business_id, {
  //     event_identifier: WebhookEventsConstants.MESSAGE_SENT,
  //     payload: evt.entity.webhook_response?.sent,
  //   });
  // }
}
