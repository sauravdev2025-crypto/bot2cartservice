import { Injectable } from '@nestjs/common';
import { CacheService, PropertyService, RemoteRawResponseDto, RemoteRequestService, SqsService } from '@servicelabsco/nestjs-utility-services';
import { BusinessWebhookEntity, SendWebhookRequestPayload, WebhookEventEntity, WebhookLogEntity } from '@servicelabsco/slabs-access-manager';
import { addDays, addMinutes } from 'date-fns';

@Injectable()
export class WebhookService {
  private webhookRelayUrl;
  private enabledEvents: string[] = [];
  private router: { route: string; expiry: Date };

  constructor(
    protected readonly cacheService: CacheService,
    private readonly remoteRequestService: RemoteRequestService,
    private readonly propertyService: PropertyService,
    private readonly sqsService: SqsService
  ) {}

  async triggerEvent(business_id: number, payload: SendWebhookRequestPayload) {
    const webhooks: BusinessWebhookEntity[] = await this.getWebhook(business_id, payload.event_identifier);
    if (!webhooks?.length) return;

    for (const webhook of webhooks) {
      await this.route(webhook, payload);
    }
  }

  private async route(webhook: BusinessWebhookEntity, data: SendWebhookRequestPayload) {
    const router = await this.getWebhookRouter();
    if (router === 'sqs') {
      return this.pushWebhookToSqs(webhook, data);
    }
    return this.pushWebhookToHttp(webhook, data);
  }

  async pushWebhookToSqs(webhook: BusinessWebhookEntity, data: SendWebhookRequestPayload) {
    const log = await this.setLog(webhook, data);
    const url = await this.getSqsUrl();
    const payload = {
      identifier: log.id,
      url: webhook.url,
      method: 'POST',
      // Add params so you can see per-request values on the receiver side
      headers: { 'content-type': 'application/json' },
      data: data?.payload,
      responseQueueUrl: 'https://sqs.ap-south-1.amazonaws.com/294337990581/dart-webhook-sqs-response',
      metadata: { webhook_id: webhook.id, type: 'webhook' },
    };

    return this.sqsService.add(url, payload);
  }

  private async pushWebhookToHttp(webhook: BusinessWebhookEntity, data: SendWebhookRequestPayload) {
    const dataPayload = {
      url: webhook?.url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    };

    const response = await this.remoteRequestService.getRawResponse(dataPayload);
    return this.createLog(response, webhook, data);
  }

  public async getSqsUrl() {
    if (this.webhookRelayUrl) return this.webhookRelayUrl;

    const url = await this.propertyService.get('webhook.sqs.url');
    this.webhookRelayUrl = url;

    return url;
  }

  private async getWebhook(business_id: number, identifier: string) {
    const isEventEnabled = await this.isEventEnabled(identifier);
    if (!isEventEnabled) return;

    const key = `business.${business_id}.webhooks.${identifier}`;
    const data = await this.cacheService.get(key);
    if (data) return data;

    const webhooks = await BusinessWebhookEntity.find({ where: { business_id, active: true, business: { active: true } } });
    if (!webhooks?.length) return;

    const enabled = webhooks.filter((webhook) => webhook.event_type.includes(identifier));

    await this.cacheService.set(key, enabled, addMinutes(new Date(), 10));

    return enabled;
  }

  private async isEventEnabled(identifier: string) {
    const enabledEvents = await this.getEnabledEvents();
    return enabledEvents?.includes(identifier);
  }

  private async getEnabledEvents() {
    if (this.enabledEvents?.length) return this.enabledEvents;

    const events = await WebhookEventEntity.find({ where: { active: true } });
    if (!events?.length) return;

    this.enabledEvents = events.map((event) => event.identifier);

    return this.enabledEvents;
  }

  private async getWebhookRouter() {
    const router = this.router;
    const now = new Date();
    if (router?.route && router.expiry > now) {
      return router.route;
    }
    const route = await this.propertyService.get('webhook.relay.router', 'sqs');
    const data = { route, expiry: addMinutes(now, 10) };

    this.router = data;
    return data.route;
  }

  private async getEvent(identifier: string) {
    const key = `webhook.event.${identifier}`;
    const data = await this.cacheService.get(key);
    if (data) return data;

    const event = await WebhookEventEntity.findOne({ where: { identifier } });
    if (!event) return;

    await this.cacheService.set(key, event, addDays(new Date(), 1));
    return event;
  }

  private async createLog(request: RemoteRawResponseDto, webhook: BusinessWebhookEntity, payload: SendWebhookRequestPayload) {
    const { event_identifier, ...rest } = payload;
    const log = WebhookLogEntity.create({ webhook_id: webhook.id });
    const event = await this.getEvent(event_identifier);

    log.event_id = event?.id;

    log.response_code = request.status;
    log.attempted_at = new Date();

    log.is_success = request.success;
    log.payload = rest;
    log.response_body = request.data;

    log.attributes = {
      ...log.attributes,
      webhook_state: webhook,
    };

    return log.save();
  }

  private async setLog(webhook: BusinessWebhookEntity, payload: SendWebhookRequestPayload) {
    const { event_identifier, ...rest } = payload;
    const log = WebhookLogEntity.create({ webhook_id: webhook.id });
    const event = await this.getEvent(event_identifier);

    log.event_id = event?.id;
    log.attempted_at = new Date();

    log.payload = rest;

    log.attributes = {
      ...log.attributes,
      webhook_state: webhook,
      mode: 'sqs',
    };

    return log.save();
  }
}
