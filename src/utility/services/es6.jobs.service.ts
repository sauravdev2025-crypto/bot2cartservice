import { Injectable } from '@nestjs/common';
import { ChatbotNodesJob } from '../jobs/chatbot.nodes.job';
import { CommunicationUserJob } from '../jobs/communication.user.job';
import { FacebookInternalLogJob } from '../jobs/facebook.internal.log.job';
import { IdentifierSerialJob } from '../jobs/identifier.serial.job';
import { LocalCommentJob } from '../jobs/local.comment.job';
import { ProcessCommonFileJob } from '../jobs/process.common.file.job';
import { SendForgetPasswordEmailJob } from '../jobs/send.forget.password.email.job';
import { StartBusinessChatSyncJob } from '../jobs/start.business.chat.sync.job';
import { SystemLanguageJob } from '../jobs/system.language.job';
import { VerifyEmailJob } from '../jobs/verify.email.job';
import { VerifyMobileJob } from '../jobs/verify.mobile.job';
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
    private readonly chatbotNodesJob: ChatbotNodesJob,
    private readonly communicationUserJob: CommunicationUserJob,
    private readonly facebookInternalLogJob: FacebookInternalLogJob,
    private readonly identifierSerialJob: IdentifierSerialJob,
    private readonly localCommentJob: LocalCommentJob,
    private readonly processCommonFileJob: ProcessCommonFileJob,
    private readonly sendForgetPasswordEmailJob: SendForgetPasswordEmailJob,
    private readonly startBusinessChatSyncJob: StartBusinessChatSyncJob,
    private readonly systemLanguageJob: SystemLanguageJob,
    private readonly verifyEmailJob: VerifyEmailJob,
    private readonly verifyMobileJob: VerifyMobileJob
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
      '91683000e9c936170050feb3d7c961a8': this.chatbotNodesJob,
      aa10e73a0286a0b10d85141168642502: this.communicationUserJob,
      '564ac153cf5b1210dfce68d038a90173': this.facebookInternalLogJob,
      '05e2da3bcd1009d250e3ee225513b8de': this.identifierSerialJob,
      d80f4527b9ab5f352f67362b8e3d348a: this.localCommentJob,
      '27169489b61da9a9b0ca5bfcb877208d': this.processCommonFileJob,
      '469ab43c20f0fa5574b5364802806e52': this.sendForgetPasswordEmailJob,
      '5bd05895934c806cb13833961eb5d8b6': this.startBusinessChatSyncJob,
      '888b8d1daf01bb5f715d8a1d4dbc8873': this.systemLanguageJob,
      '8baab390aa21eae8e9d738fc4f4ab257': this.verifyEmailJob,
      e027f7aa6f004414f549cdd0bbd46ac6: this.verifyMobileJob,
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
