import { Injectable } from '@nestjs/common';
import {
  CacheService,
  PropertyService,
  RemoteRawResponseDto,
  RemoteRequestService,
  SourceColumnDto,
  SqsService,
} from '@servicelabsco/nestjs-utility-services';
import { addDays } from 'date-fns';
import { FACEBOOK_INTERNAL_CONFIGURATION } from '../../config/facebook.internal.endpoint.constant';
import { FacebookInternalLogEntity } from '../../utility/entities/facebook.internal.log.entity';
import { IdentifierGeneratorService } from '../../utility/services/identifier.generator.service';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { BusinessEntity } from '../entities/business.entity';
import { WebhookService } from './webhook.service';

type config = keyof typeof FACEBOOK_INTERNAL_CONFIGURATION;

/**
 * Service for handling Facebook internal API interactions
 * @class FacebookInternalService
 * @description Provides methods for making POST requests to Facebook's internal APIs,
 * saving logs of interactions, and handling webhook responses.
 */
@Injectable()
export class FacebookInternalService {
  protected baseUrl: string;

  protected app_id: string;
  protected client_secret: string;
  protected client_id: string;
  protected config_id: string;

  protected responseQueueUrl: string = 'https://sqs.ap-south-1.amazonaws.com/294337990581/dart-webhook-sqs-response';

  constructor(
    protected readonly remoteRequestService: RemoteRequestService,
    protected readonly propertyService: PropertyService,
    protected readonly identifierGeneratorService: IdentifierGeneratorService,
    protected readonly cacheService: CacheService,
    protected readonly sqsService: SqsService,
    protected readonly webhookService: WebhookService
  ) {}

  /**
   * Sends a POST request to Facebook's internal API
   * @param payload - The data to send in the request body
   * @param options - Configuration options including endpoint and source information
   * @returns Promise resolving to the response data from Facebook
   * @example
   * const response = await facebookInternalService.POST(payload, {
   *   endPoint: 'messageTemplate',
   *   source: { source_id: 123, source_type: 'template' }
   * });
   */
  public async POST(
    payload: any,
    { configs, source, business_id, url }: { configs: config; source: SourceColumnDto; business_id: number; url?: string }
  ): Promise<RemoteRawResponseDto['data']> {
    const config = FACEBOOK_INTERNAL_CONFIGURATION[configs];

    const { baseUrl, token, identifier } = await this.getBusinessFacebookProperties(business_id, config?.end_point);

    const options = {
      url: url || `${baseUrl}/${identifier}/${config.end_point}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    };

    const response = await this.remoteRequestService.getRawResponse(options);
    await this.saveLogs(source, { payload: options, response: response.data });

    return response?.data;
  }

  public async POST_QUEUE(
    payload: any,
    { configs, source, business_id, url, type }: { configs: config; source: SourceColumnDto; business_id: number; url?: string; type?: string }
  ): Promise<any> {
    const config = FACEBOOK_INTERNAL_CONFIGURATION[configs];

    const { baseUrl, token, identifier } = await this.getBusinessFacebookProperties(business_id, config?.end_point);

    const options = {
      identifier: source?.source_id,
      url: url || `${baseUrl}/${identifier}/${config.end_point}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: payload,
      responseQueueUrl: this.responseQueueUrl,
      metadata: { message_id: source.source_id, type },
    };

    const response = await this.remoteRequestService.getRawResponse(options);
    await this.saveLogs(source, { payload: options, response: response.data });

    return response?.data;
  }

  public async sendViaHttps(message: BroadcastMessageEntity, { configs }: { configs: config }): Promise<any> {
    const source = {
      source_type: message.source_type,
      source_id: message.id,
    };

    const payload = message.payload;
    return this.POST(payload, { configs, business_id: message.business_id, source });
  }

  public async sendToQueue(message: BroadcastMessageEntity, { configs }: { configs: config }): Promise<any> {
    const config = FACEBOOK_INTERNAL_CONFIGURATION[configs];

    const { baseUrl, token, identifier } = await this.getBusinessFacebookProperties(message.business_id, config?.end_point);
    const url = await this.webhookService.getSqsUrl();

    const source = {
      source_type: message.source_type,
      source_id: message.id,
    };

    const options = {
      identifier: message?.id,
      url: `${baseUrl}/${identifier}/${config.end_point}`,
      method: 'POST',
      // Add params so you can see per-request values on the receiver side
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      data: message?.payload,
      responseQueueUrl: this.responseQueueUrl,
      metadata: { message_id: message.id, type: 'broadcast' },
    };

    await this.saveLogs(source, { payload: options });
    return this.sqsService.add(url, options);
  }

  /**
   * Saves logs of Facebook API interactions
   * @param source - Source information for the log
   * @param payload - The payload sent in the request
   * @param response - The response received from Facebook
   * @returns Promise resolving to the saved log entity
   * @private
   */
  private saveLogs(source: SourceColumnDto, { payload, response }: any): Promise<FacebookInternalLogEntity> {
    const log = FacebookInternalLogEntity.create({ ...source });

    log.payload = payload;
    log.response = response;
    log.is_incoming = false;

    return log.save();
  }

  /**
   * Saves webhook response logs
   * @param source - Source information for the log
   * @param response - The webhook response data
   * @returns Promise resolving to the saved log entity
   * @example
   * await facebookInternalService.saveWebhookLog(source, webhookResponse);
   */
  public async saveWebhookLog(source: SourceColumnDto, response: any): Promise<FacebookInternalLogEntity> {
    const log = await FacebookInternalLogEntity.firstOrNew({ ...source });

    log.webhook_response = response;
    log.is_incoming = true;

    return log.save();
  }

  /**
   * Retrieves Facebook-related properties from the property service
   * @returns Promise resolving to an object containing baseUrl and token
   * @private
   */
  public async getBusinessFacebookProperties(business_id: number, end_point: string) {
    const key = `getBusinessFacebookProperties.${business_id}.${end_point}`;

    const data = await this.cacheService.get(key);
    if (data) return data;

    const business = await BusinessEntity.first(business_id);
    if (!business.internal_access_token) return;

    const baseUrl = await this.getOfficialBaseUrl();
    const isMessage = end_point === FACEBOOK_INTERNAL_CONFIGURATION.message.end_point;

    const payload = { token: business.internal_access_token, baseUrl, identifier: isMessage ? business.internal_number : business?.internal_id };
    await this.cacheService.set(key, payload, addDays(new Date(), 2));

    return payload;
  }

  public async metaInternalProperty() {
    const app_id = this.app_id || (await this.propertyService.get('meta.app.id'));
    const client_secret = this.client_secret || (await this.propertyService.get('meta.client.secret'));
    const client_id = this.client_id || (await this.propertyService.get('meta.client.id'));
    const config_id = this.config_id || (await this.propertyService.get('meta.configuration.id'));

    return { app_id, client_secret, client_id, config_id };
  }

  public async getOfficialBaseUrl() {
    if (this.baseUrl) return this.baseUrl;

    const baseUrl = await this.propertyService.get('facebook.internal.base.url');
    this.baseUrl = baseUrl;

    return baseUrl;
  }
}
