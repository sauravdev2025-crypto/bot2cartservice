import { RemoteRawResponseDto, RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import {
  AccessBusinessEntity,
  BusinessWebhookEntity,
  SendWebhookRequestPayload,
  WebhookEventEntity,
  WebhookLogEntity,
} from '@servicelabsco/slabs-access-manager';

/**
 *
 * @description This will send the message to webhook
 */
export class SendWebhookRequest {
  protected webhooks: BusinessWebhookEntity[];
  protected payload: SendWebhookRequestPayload;

  constructor(
    private readonly business: AccessBusinessEntity,
    private readonly remoteRequestService: RemoteRequestService
  ) {}

  async process(payload: SendWebhookRequestPayload) {
    this.payload = payload;

    await this.validate();
    return this.sendRequest();
  }

  private async validate() {
    const webhooks = await BusinessWebhookEntity.find({ where: { business_id: this.business.id, active: true } });
    if (!webhooks?.length) return;

    const event = await WebhookEventEntity.findOne({ where: { identifier: this.payload.event_identifier } });
    if (!event?.active) return;

    this.webhooks = webhooks;
  }

  private async sendRequest() {
    if (!this.webhooks.length) return;

    for await (const webhook of this.webhooks) {
      const hasEventEnabled = webhook.event_type.includes(this.payload.event_identifier);
      if (!hasEventEnabled) continue;

      const dataPayload = {
        url: webhook?.url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: this.payload?.payload,
      };

      let data = await this.remoteRequestService.getRawResponse(dataPayload);
      // if (data?.status !== 200) await this.disableWebhook(webhook.id);

      return this.saveLog(data, webhook);
    }
  }

  private async disableWebhook(webhook_id: number) {
    const webhook = await BusinessWebhookEntity.first(webhook_id);
    webhook.active = false;
    return webhook.save();
  }

  private async saveLog(request: RemoteRawResponseDto, webhook: BusinessWebhookEntity) {
    const log = WebhookLogEntity.create({ webhook_id: webhook.id });
    const event = await WebhookEventEntity.findOne({ where: { identifier: this.payload.event_identifier } });

    log.event_id = event?.id;

    log.response_code = request.status;
    log.attempted_at = new Date();

    log.is_success = request.success;
    log.payload = this.payload?.payload;
    log.response_body = request.data;

    (log.attributes as any) = {
      ...log.attributes,
      webhook_state: webhook,
    };

    return log.save();
  }
}
