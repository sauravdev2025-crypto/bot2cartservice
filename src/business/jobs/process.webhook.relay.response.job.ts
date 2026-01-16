import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { WebhookLogEntity } from '@servicelabsco/slabs-access-manager';

@Injectable()
export class ProcessWebhookRelayResponseJob extends CommonJob {
  protected priority = 20;

  constructor(protected readonly queueService: QueueService) {
    super('efd8463ca770d34b8ee26d4724422526');
  }

  async handle(payload: any) {
    const webhookEntity = await WebhookLogEntity.first(payload?.identifier);
    if (!webhookEntity) return;

    webhookEntity.response_code = payload.status;
    webhookEntity.is_success = payload.success;
    webhookEntity.response_body = payload;

    return webhookEntity.save();
  }
}
