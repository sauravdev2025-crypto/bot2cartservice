import { Injectable } from '@nestjs/common';
import { BusinessJob } from '../jobs/business.job';
import { BusinessSettingDetailJob } from '../jobs/business.setting.detail.job';
import { BusinessUserInvitationJob } from '../jobs/business.user.invitation.job';
import { LocalBulkUploadJob } from '../jobs/local.bulk.upload.job';
import { LocalBusinessUserJob } from '../jobs/local.business.user..job';
import { LocalBusinessWebhookJob } from '../jobs/local.business.webhook.job';
import { ProcessBulkUploadJob } from '../jobs/process.bulk.upload.job';
import { ProcessWebhookRelayResponseJob } from '../jobs/process.webhook.relay.response.job';
import { PlatformUtility } from '@servicelabsco/nestjs-utility-services';

/**
 * this would get all the jobs which is part of the given module
 * @export
 * @class Es6JobsService
 */
@Injectable()
export class Es6JobsService {
  private jobs = {};

  constructor(
    private readonly businessJob: BusinessJob,
    private readonly businessSettingDetailJob: BusinessSettingDetailJob,
    private readonly businessUserInvitationJob: BusinessUserInvitationJob,
    private readonly localBulkUploadJob: LocalBulkUploadJob,
    private readonly localBusinessUserJob: LocalBusinessUserJob,
    private readonly localBusinessWebhookJob: LocalBusinessWebhookJob,
    private readonly processBulkUploadJob: ProcessBulkUploadJob,
    private readonly processWebhookRelayResponseJob: ProcessWebhookRelayResponseJob
  ) {
    this.alignJobs();
    this.setJobs();
  }

  /**
   * this would assign all the jobs which is defined
   * @memberof Es6JobsService
   */
  alignJobs() {
    this.jobs = {
      e4404373285ba072d374bc17008b03f1: this.businessJob,
      eb79ef4172c04abb844f0db7978ca0d5: this.businessSettingDetailJob,
      '20bb602509111f21ad8f06d3a03fb5b6': this.businessUserInvitationJob,
      ce20d57ab8a4f605e5000a6225b0bf32: this.localBulkUploadJob,
      '518a9cebd6b1c6b6238bcfe77983db1e': this.localBusinessUserJob,
      '1ab78bea89d605e9f421a2e974c4ebb6': this.localBusinessWebhookJob,
      '2138b885ef3ab43742d8661c2077a362': this.processBulkUploadJob,
      efd8463ca770d34b8ee26d4724422526: this.processWebhookRelayResponseJob,
    };
  }

  /**
   * assign the jobs service to the local property
   * @memberof Es6JobsService
   */
  setJobs() {
    PlatformUtility.setJobs(this.jobs);
  }
}
