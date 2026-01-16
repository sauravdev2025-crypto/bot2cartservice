import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CacheService, OperationException, RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import axios from 'axios';
import { addDays } from 'date-fns';
import * as FormData from 'form-data';
import { IsNull, Not } from 'typeorm';
import { BusinessEntity } from '../../business/entities/business.entity';
import { BusinessAccessService } from '../../business/services/business.access.service';
import { FacebookInternalService } from '../../business/services/facebook.internal.service';
import { FacebookInternalLogEntity } from '../entities/facebook.internal.log.entity';
import { StartBusinessChatSyncJob } from '../jobs/start.business.chat.sync.job';
import { FileUploadService } from './file.upload.service';
import console = require('console');

const fs = require('fs');
const path = require('path');
const os = require('os');

@Injectable()
export class BusinessMetaIntegrationService {
  constructor(
    protected readonly facebookInternalService: FacebookInternalService,
    protected readonly remoteRequestService: RemoteRequestService,
    protected readonly businessAccessService: BusinessAccessService,
    protected readonly fileUploadService: FileUploadService,
    protected readonly cacheServer: CacheService,
    protected readonly startBusinessChatSyncJob: StartBusinessChatSyncJob
  ) {}

  async getAccessToken(code: string, business_id: number) {
    const { client_id, client_secret } = await this.facebookInternalService.metaInternalProperty();

    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    if (!code) return;

    const params = `?code=${code}&client_secret=${client_secret}&client_id=${client_id}`;

    const options = {
      url: `${baseUrl}/oauth/access_token${params}`,
      method: 'GET',
    };

    return this.sendRequest(business_id, options);
  }

  async getBusinessProfile(business_id: number) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token, internal_number } = await this.businessAccessService.getInternalProperties(business_id);

    if (!access_token) return;

    const options = {
      url: `${baseUrl}/${internal_number}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    return this.sendRequest(business_id, options);
  }

  async updateBusinessProfile(business_id: number, profileData: any) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token, internal_number } = await this.businessAccessService.getInternalProperties(business_id);

    if (!access_token) return;

    const options = {
      url: `${baseUrl}/${internal_number}/whatsapp_business_profile`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        ...profileData,
      },
    };

    return this.sendRequest(business_id, options);
  }

  async subscribeApp(wabaId: string, business_id: number) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const business_token = await this.businessAccessService.getInternalProperties(business_id);

    if (!business_token?.access_token) return;

    const options = {
      url: `${baseUrl}/${wabaId}/subscribed_apps`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${business_token?.access_token}`,
      },
    };

    return this.sendRequest(business_id, options);
  }

  async registerPhoneNumber(phoneNumberId: string, business_id: number, pin: number = 121212) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const business_token = await this.businessAccessService.getInternalProperties(business_id);

    if (!business_token?.access_token) return;

    const options = {
      url: `${baseUrl}/${phoneNumberId}/register`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${business_token?.access_token}`,
      },
      data: {
        messaging_product: 'whatsapp',
        pin: pin,
      },
    };

    return this.sendRequest(business_id, options);
  }

  async getPhoneNumbers(business_id: number) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token, internal_id } = await this.businessAccessService.getInternalProperties(business_id);

    if (!access_token) return;

    const options = {
      url: `${baseUrl}/${internal_id}/phone_numbers`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    return this.sendRequest(business_id, options);
  }
  async getHealthStatus(business_id: number) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token, internal_id } = await this.businessAccessService.getInternalProperties(business_id);

    if (!access_token) return;

    const options = {
      url: `${baseUrl}/${internal_id}?fields=health_status`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    return this.sendRequest(business_id, options);
  }

  async getBusinessQualityRating(business_id: number) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token, internal_number } = await this.businessAccessService.getInternalProperties(business_id);

    if (!access_token) return;

    const options = {
      url: `${baseUrl}/${internal_number}?fields=quality_rating,messaging_limit_tier,verified_name,throughput,display_phone_number`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    return this.sendRequest(business_id, options);
  }

  async setBusinessAccessToken(code: string, business_id: number) {
    const tokenResponse = await this.getAccessToken(code, business_id);
    if (!tokenResponse?.success) return;

    const business = await BusinessEntity.first(business_id);
    business.internal_access_token = tokenResponse.data?.code;

    return business.save();
  }

  private async saveLog(business_id: number, options: { payload: any; response: any }) {
    const log = FacebookInternalLogEntity.create({});

    log.source_type = 'business-onboarding';
    log.source_id = business_id;
    log.payload = options?.payload;
    log.response = options?.response;
    log.is_incoming = false;

    return log.save();
  }

  async sendRequest(business_id: number, options: any) {
    const response = await this.remoteRequestService.getRawResponse(options);
    await this.saveLog(business_id, { payload: options, response: response.data });
    return response;
  }

  async startUploadSession(fileName: string, fileLength: number, fileType: string, business_id: number) {
    const { app_id } = await this.facebookInternalService.metaInternalProperty();
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token } = await this.businessAccessService.getInternalProperties(business_id);

    const options = {
      url: `${baseUrl}/${app_id}/uploads?file_name=${fileName}&file_length=${fileLength}&file_type=${fileType}&access_token=${access_token}`,
      method: 'POST',
    };

    const response = await this.sendRequest(business_id, options);
    return response.data; // Return the upload session ID
  }

  async createUploadSessionViaUrl(business_id: number, file_url: string): Promise<any> {
    // Get business entity to retrieve access token and app id
    const business = await BusinessEntity.first(business_id);
    if (!business?.internal_access_token || !business?.internal_id) {
      throw new InternalServerErrorException('Business internal access token or app id not found');
    }

    const fileDetail = await this.fileUploadService.getFileDetailFromUrl(file_url);

    const params = {
      file_name: fileDetail.file_name,
      file_length: fileDetail.file_length,
      file_type: fileDetail.file_type,
    };

    return this.startUploadSession(params.file_name, params.file_length, params.file_type, business_id);
  }

  async uploadInternalFile(business_id: number, file_url: string) {
    const uploadSession = await this.createUploadSessionViaUrl(business_id, file_url);
    if (!uploadSession?.id) throw new NotFoundException('Failed to start upload session');

    // Download the file from the URL and create a buffer

    const fileResponse = await axios.get(file_url, { responseType: 'arraybuffer' });
    const createFileBuffer = Buffer.from(fileResponse.data);

    const uploadResponse = await this.uploadFile(uploadSession.id, createFileBuffer, business_id);
    if (!uploadResponse?.h) throw new NotFoundException('Failed to upload file');

    return uploadResponse;
  }

  async uploadFile(uploadSessionId: string, fileBuffer: Buffer, business_id: number) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token } = await this.businessAccessService.getInternalProperties(business_id);

    if (!access_token) return;

    const options = {
      url: `${baseUrl}/${uploadSessionId}`,
      method: 'POST',
      headers: {
        Authorization: `OAuth ${access_token}`,
        file_offset: '0', // Start from the beginning
      },
      data: fileBuffer,
    };

    const response = await this.sendRequest(business_id, options);
    return response.data; // Return the file handle
  }

  async syncBusinessInfo(business_id: number) {
    const business = await BusinessEntity.findOne({ where: { id: business_id, active: true, internal_access_token: Not(IsNull()) } });
    if (!business) return;

    const quality = await this.getBusinessQualityRating(business.id);
    const status = await this.getHealthStatus(business.id);

    const verifiedEntity = status?.data?.health_status?.entities?.find((data) => data?.entity_type === 'BUSINESS');
    const isNotVerified = verifiedEntity?.errors?.length > 0;

    business.last_health_status = status?.data;
    business.verified_at = isNotVerified ? null : new Date();

    if (quality?.data?.messaging_limit_tier) business.total_message_limit = this.formatLimitTier(quality?.data?.messaging_limit_tier);
    business.quality_response = quality.data;

    if (!business.default_mobile) {
      const getAvailableMobile = await this.getPhoneNumbers(business.id);
      const mobile = getAvailableMobile?.data?.data?.find((mobData) => mobData?.id === business.internal_number);

      business.default_mobile = mobile?.display_phone_number?.replace(/\s+/g, '');
      business.wa_display_name = mobile?.verified_name;
    }

    return business.save();
  }

  async setPhoneNumber() {}
  async uploadMediaFromUrl(business_id: number, mediaUrl: string): Promise<string> {
    const cacheKey = `${business_id}.${mediaUrl}.media_id`;
    const isOnCache = await this.cacheServer.get(cacheKey);
    if (isOnCache) return isOnCache;

    const { access_token, internal_number } = await this.businessAccessService.getInternalProperties(business_id);
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();

    async function downloadFile(url: string, dest: string): Promise<void> {
      const writer = fs.createWriteStream(dest);
      const response = await axios.get(url, { responseType: 'stream' });
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error: any = null;
        writer.on('error', (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) resolve();
        });
      });
    }

    let tempFilePath: string | null = null;
    try {
      // 1. Download file to local temp
      const getFileType = await this.fileUploadService.getFileDetailFromUrl(mediaUrl);
      const fileExt = getFileType.file_type ? `.${getFileType.file_type.split('/').pop()}` : '';
      const fileName = `wa_media_${Date.now()}${fileExt}`;
      tempFilePath = path.join(os.tmpdir(), fileName);

      await downloadFile(mediaUrl, tempFilePath);

      // 2. Prepare form data for upload
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', getFileType.file_type);
      formData.append('file', fs.createReadStream(tempFilePath));

      const url = `${baseUrl}/${internal_number}/media`;

      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          ...formData.getHeaders(),
        },
      });

      // 3. Delete local file
      try {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (delErr) {
        console.warn('Warning: Failed to delete temp file', tempFilePath, delErr);
      }

      if (response.data.id) {
        await this.cacheServer.set(cacheKey, response.data.id, addDays(new Date(), 10));
        return response.data.id;
      } else {
        throw new Error('Failed to upload media. No media ID returned.');
      }
    } catch (error: any) {
      // Attempt to clean up temp file on error
      try {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (delErr) {
        console.warn('Warning: Failed to delete temp file after error', tempFilePath, delErr);
      }
      console.error('❌ Error uploading media:', error.response?.data || error.message);
      throw error;
    }
  }

  formatLimitTier(tier: string): number {
    if (!tier) return 0;

    const tierMap = {
      TIER_50: 50,
      TIER_250: 250,
      TIER_1K: 1000,
      TIER_10K: 10000,
      TIER_100K: 100000,
      TIER_UNLIMITED: Number.MAX_SAFE_INTEGER,
    };

    return tierMap[tier] || Math.abs(parseInt(tier.replace(/\D/g, '')));
  }

  async connectClient(business_id: number, body: any) {
    const business = await BusinessEntity.first(business_id);

    if (body?.code && !business?.internal_access_token) {
      const getAccessToken = await this.getAccessToken(body?.code, business.id);
      if (!getAccessToken.success) throw new OperationException('Failed to authenticate');
      if (getAccessToken.data?.access_token) business.internal_access_token = getAccessToken.data?.access_token;
    }

    if (body?.data?.waba_id && !business?.internal_id) business.internal_id = body?.data?.waba_id;
    if (body?.data?.phone_number_id && !business?.internal_number) business.internal_number = body?.data?.phone_number_id;

    await business.save();

    if (!business?.internal_number && !body?.data?.phone_number_id) {
      const getAvailableMobile = await this.getPhoneNumbers(business.id);
      const mobile = getAvailableMobile?.data?.data?.find((mobData) => mobData?.id);

      if (mobile) {
        business.default_mobile = mobile?.display_phone_number?.replace(/\s+/g, '');
        business.internal_number = mobile?.id;
        business.wa_display_name = mobile?.verified_name;
        business.phone_registered_at = new Date();

        await business.save();
        await this.startBusinessChatSyncJob.dispatch(business?.id);
      }
    }
    return business;
  }
}
