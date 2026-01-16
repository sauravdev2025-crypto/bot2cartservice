import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CacheService, PropertyService, RemoteRequestService, SourceColumnDto } from '@servicelabsco/nestjs-utility-services';
import axios from 'axios';
import SourceHash from '../../config/source.hash';
import { BusinessService } from '../../utility/services/business.service';
import { FileUploadService } from '../../utility/services/file.upload.service';
import { FacebookSendTemplateMessageDto } from '../dtos/facebook.send.template.message.dto';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { BusinessAccessService } from './business.access.service';
import { FacebookInternalService } from './facebook.internal.service';

/**
 * Service for handling Facebook internal message operations
 * @class FacebookInternalMessageService
 * @description This service provides methods for sending template messages and broadcast messages through Facebook's internal API
 */
@Injectable()
export class FacebookInternalMessageService {
  /**
   * Creates an instance of FacebookInternalMessageService
   * @param {FacebookInternalService} facebookInternalService - The internal Facebook service instance
   */
  constructor(
    protected readonly facebookInternalService: FacebookInternalService,
    protected readonly propertyService: PropertyService,
    protected readonly remoteRequestService: RemoteRequestService,
    protected readonly fileUploadService: FileUploadService,
    protected readonly businessAccessService: BusinessAccessService,
    protected readonly cacheService: CacheService,
    protected readonly businessService: BusinessService
  ) {}

  /**
   * Sends a template message through Facebook's internal API
   * @param {SourceColumnDto} source - The source information for the message
   * @param {FacebookSendTemplateMessageDto} payload - The message payload to send
   * @returns {Promise<any>} The result of the API call
   */
  async sendTemplateMessage(source: SourceColumnDto, payload: FacebookSendTemplateMessageDto, business_id: number): Promise<any> {
    return this.facebookInternalService.POST(payload, { configs: 'message', source, business_id });
  }

  async getDocumentFromId(id: string, business_id: number) {
    const rawData = await this.getDocumentRawData(id, business_id);
    return this.getDocumentFromUrl(rawData?.data, business_id);
  }

  private async getDocumentFromUrl(data: any, business_id: number) {
    if (!data?.url) return;

    const business = await this.businessService.getBusiness(business_id);
    if (!business?.internal_access_token) return;

    try {
      const fileResponse = await axios.get(data?.url, {
        responseType: 'stream',
        headers: {
          Authorization: `Bearer ${business.internal_access_token}`,
        },
      });

      return fileResponse;
    } catch (error) {
      console.error('Error fetching file from WhatsApp:', error);
      throw new InternalServerErrorException('Could not retrieve file from WhatsApp');
    }
  }

  public async getDocumentRawData(id: string, business_id: number) {
    const business = await this.businessService.getBusiness(business_id);
    if (!business?.internal_access_token) return;

    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();

    const options = {
      url: `${baseUrl}/${id}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${business?.internal_access_token}` },
    };

    return this.remoteRequestService.getRawResponse(options);
  }

  /**
   * Sends a broadcast message by first retrieving it and then sending as a template message
   * @param {number} broadcast_id - The ID of the broadcast message to send
   * @returns {Promise<any>} The result of sending the template message
   */
  async sendBroadcastMessage(broadcast_id: number): Promise<BroadcastMessageEntity> {
    const message = await BroadcastMessageEntity.first(broadcast_id);
    if (!message?.payload) return;

    const source: SourceColumnDto = {
      source_type: SourceHash.BroadcastMessages,
      source_id: message.id,
    };

    const response = await this.sendTemplateMessage(source, message.payload, message.business_id);

    message.is_error = !!response?.error;
    message.active = true;

    message.response = response;
    message.message_id = response?.messages?.[0]?.id;

    return message.save();
  }

  async sendQueueBroadcastMessage(message: BroadcastMessageEntity): Promise<BroadcastMessageEntity> {
    return this.facebookInternalService.sendToQueue(message, {
      configs: 'message',
    });
  }

  /**
   * Sends a broadcast message by first retrieving it and then sending as a template message
   * @param {number} broadcast_id - The ID of the broadcast message to send
   * @returns {Promise<any>} The result of sending the template message
   */
  async sendViaHttps(broadcast_id: number): Promise<BroadcastMessageEntity> {
    const message = await BroadcastMessageEntity.first(broadcast_id);
    if (!message?.payload) return;

    const source: SourceColumnDto = {
      source_type: SourceHash.BroadcastMessages,
      source_id: message.id,
    };

    const response = await this.sendTemplateMessage(source, message.payload, message.business_id);

    message.is_error = !!response?.error;
    message.active = true;

    message.response = response;
    message.message_id = response?.messages?.[0]?.id;

    return message.save();
  }

  public getFileExtension(contentType: string): string {
    switch (contentType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'application/pdf':
        return 'pdf';
      default:
        return 'bin';
    }
  }

  async markMessageAsRead(messageId: string, business_id: number, source: SourceColumnDto) {
    return this.facebookInternalService.POST_QUEUE(
      { messaging_product: 'whatsapp', status: 'read', message_id: messageId },
      { business_id, configs: 'message', source, type: 'mark_read' }
    );
  }
}
