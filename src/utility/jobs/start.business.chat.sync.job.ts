import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import { BusinessAccessService } from '../../business/services/business.access.service';
import { FacebookInternalService } from '../../business/services/facebook.internal.service';
import { FacebookInternalLogEntity } from '../entities/facebook.internal.log.entity';

@Injectable()
export class StartBusinessChatSyncJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly facebookInternalService: FacebookInternalService,
    protected readonly businessAccessService: BusinessAccessService,
    protected readonly remoteRequestService: RemoteRequestService
  ) {
    super('5bd05895934c806cb13833961eb5d8b6');
  }

  async handle(business_id: number) {
    await this.syncBusinessAppData(business_id, 'smb_app_state_sync'); // contact sync
    await this.syncBusinessAppData(business_id, 'history'); // history
  }

  async syncBusinessAppData(business_id: number, syncType: 'smb_app_state_sync' | 'history' = 'smb_app_state_sync') {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token, internal_number } = await this.businessAccessService.getInternalProperties(business_id);

    if (!access_token) return;

    const options = {
      url: `${baseUrl}/${internal_number}/smb_app_data`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        sync_type: syncType,
      },
    };

    const response = await this.remoteRequestService.getRawResponse(options);
    await this.saveLog(business_id, { payload: options, response: response.data });
    return response;
  }

  private async saveLog(business_id: number, options: { payload: any; response: any }) {
    const log = FacebookInternalLogEntity.create({});

    log.source_type = 'business-onboarding-chat';
    log.source_id = business_id;
    log.payload = options?.payload;
    log.response = options?.response;
    log.is_incoming = false;

    return log.save();
  }
}
