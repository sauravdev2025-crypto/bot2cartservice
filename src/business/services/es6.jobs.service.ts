import { Injectable } from '@nestjs/common';
import { ActionDetailsJob } from '../jobs/action.details.job';
import { BroadcastMessageJob } from '../jobs/broadcast.message.job';
import { BusinessJob } from '../jobs/business.job';
import { BusinessSettingDetailJob } from '../jobs/business.setting.detail.job';
import { BusinessUserInvitationJob } from '../jobs/business.user.invitation.job';
import { BusinessWebhookEventTriggerJob } from '../jobs/business.webhook.event.trigger.job';
import { ChatbotConnectedEdgesJob } from '../jobs/chatbot.connected.edges.job';
import { ChatbotConnectedNodeJob } from '../jobs/chatbot.connected.node.job';
import { ChatbotDetailJob } from '../jobs/chatbot.detail.job';
import { ChatbotFlowJob } from '../jobs/chatbot.flow.job';
import { ChatbotFlowNextStepOnExpire } from '../jobs/chatbot.flow.next.step.on.expire';
import { ChatbotFlowStepJob } from '../jobs/chatbot.flow.step.job';
import { ChatbotVersionJob } from '../jobs/chatbot.version.job';
import { CheckSystemHealthJob } from '../jobs/check.system.health.job';
import { ClearConversationHistoryJob } from '../jobs/clear.conversation.history.job';
import { CommunicationWhatsappTemplateJob } from '../jobs/communication.whatsapp.template.job';
import { ContactJob } from '../jobs/contact.job';
import { HandleAutoAssignToBotJob } from '../jobs/handle.auto.assign.to.bot.job';
import { HandleFacebookApprovalJob } from '../jobs/handle.facebook.approval.job';
import { HandleFacebookBusinessAppSyncJob } from '../jobs/handle.facebook.business.app.sync.job';
import { HandleFacebookMessagesJob } from '../jobs/handle.facebook.messages.job';
import { HandleFacebookWebhookJob } from '../jobs/handle.facebook.webhook.job';
import { HandleSendExpiryReminderJob } from '../jobs/handle.send.expiry.reminder.job';
import { HandleWhatsappBusinessAccountJob } from '../jobs/handle.whatsapp.business.account.job';
import { ImportBusinessTemplateJob } from '../jobs/import.business.template.job';
import { KeywordActionDetailJob } from '../jobs/keyword.action.detail.job';
import { KeywordActionTriggerDetailJob } from '../jobs/keyword.action.trigger.detail.job';
import { KeywordDetailJob } from '../jobs/keyword.detail.job';
import { LocalBulkUploadJob } from '../jobs/local.bulk.upload.job';
import { LocalBusinessUserJob } from '../jobs/local.business.user..job';
import { LocalBusinessWebhookJob } from '../jobs/local.business.webhook.job';
import { MarkAsReadJob } from '../jobs/mark.as.read.job';
import { PollSqsQueueJob } from '../jobs/poll.sqs.queue.job';
import { PollWebhookRelaySqsJob } from '../jobs/poll.webhook.relay.sqs.job';
import { PollWhatsappIncomingMessageJob } from '../jobs/poll.whatsapp.incoming.message.job';
import { ProcessBroadcastMessageResponseJob } from '../jobs/process.broadcast.message.response.job';
import { ProcessBulkUploadJob } from '../jobs/process.bulk.upload.job';
import { ProcessWebhookRelayResponseJob } from '../jobs/process.webhook.relay.response.job';
import { QuickReplyJob } from '../jobs/quick.reply.job';
import { ScheduleBroadcastJob } from '../jobs/schedule.broadcast.job';
import { SendPushNotificationJob } from '../jobs/send.push.notification.job';
import { SendScheduledMessageJob } from '../jobs/send.scheduled.message.job';
import { SendScheduledMessagesJob } from '../jobs/send.scheduled.messages.job';
import { SetScheduleBroadcastJob } from '../jobs/set.schedule.broadcast.job';
import { SetTeamInboxStatusJob } from '../jobs/set.team.inbox.status.job';
import { SyncBroadcastMessageStatsJob } from '../jobs/sync.broadcast.message.stats.job';
import { SyncBusinessQualityHealthJob } from '../jobs/sync.business.quality.health.job';
import { TeamInboxJob } from '../jobs/team.inbox.job';
import { TriggerTeamInboxChatSocketJob } from '../jobs/trigger.team.inbox.chat.socket.job';
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
    private readonly actionDetailsJob: ActionDetailsJob,
    private readonly broadcastMessageJob: BroadcastMessageJob,
    private readonly businessJob: BusinessJob,
    private readonly businessSettingDetailJob: BusinessSettingDetailJob,
    private readonly businessUserInvitationJob: BusinessUserInvitationJob,
    private readonly businessWebhookEventTriggerJob: BusinessWebhookEventTriggerJob,
    private readonly chatbotConnectedEdgesJob: ChatbotConnectedEdgesJob,
    private readonly chatbotConnectedNodeJob: ChatbotConnectedNodeJob,
    private readonly chatbotDetailJob: ChatbotDetailJob,
    private readonly chatbotFlowJob: ChatbotFlowJob,
    private readonly chatbotFlowNextStepOnExpire: ChatbotFlowNextStepOnExpire,
    private readonly chatbotFlowStepJob: ChatbotFlowStepJob,
    private readonly chatbotVersionJob: ChatbotVersionJob,
    private readonly checkSystemHealthJob: CheckSystemHealthJob,
    private readonly clearConversationHistoryJob: ClearConversationHistoryJob,
    private readonly communicationWhatsappTemplateJob: CommunicationWhatsappTemplateJob,
    private readonly contactJob: ContactJob,
    private readonly handleAutoAssignToBotJob: HandleAutoAssignToBotJob,
    private readonly handleFacebookApprovalJob: HandleFacebookApprovalJob,
    private readonly handleFacebookBusinessAppSyncJob: HandleFacebookBusinessAppSyncJob,
    private readonly handleFacebookMessagesJob: HandleFacebookMessagesJob,
    private readonly handleFacebookWebhookJob: HandleFacebookWebhookJob,
    private readonly handleSendExpiryReminderJob: HandleSendExpiryReminderJob,
    private readonly handleWhatsappBusinessAccountJob: HandleWhatsappBusinessAccountJob,
    private readonly importBusinessTemplateJob: ImportBusinessTemplateJob,
    private readonly keywordActionDetailJob: KeywordActionDetailJob,
    private readonly keywordActionTriggerDetailJob: KeywordActionTriggerDetailJob,
    private readonly keywordDetailJob: KeywordDetailJob,
    private readonly localBulkUploadJob: LocalBulkUploadJob,
    private readonly localBusinessUserJob: LocalBusinessUserJob,
    private readonly localBusinessWebhookJob: LocalBusinessWebhookJob,
    private readonly markAsReadJob: MarkAsReadJob,
    private readonly pollSqsQueueJob: PollSqsQueueJob,
    private readonly pollWebhookRelaySqsJob: PollWebhookRelaySqsJob,
    private readonly pollWhatsappIncomingMessageJob: PollWhatsappIncomingMessageJob,
    private readonly processBroadcastMessageResponseJob: ProcessBroadcastMessageResponseJob,
    private readonly processBulkUploadJob: ProcessBulkUploadJob,
    private readonly processWebhookRelayResponseJob: ProcessWebhookRelayResponseJob,
    private readonly quickReplyJob: QuickReplyJob,
    private readonly scheduleBroadcastJob: ScheduleBroadcastJob,
    private readonly sendPushNotificationJob: SendPushNotificationJob,
    private readonly sendScheduledMessageJob: SendScheduledMessageJob,
    private readonly sendScheduledMessagesJob: SendScheduledMessagesJob,
    private readonly setScheduleBroadcastJob: SetScheduleBroadcastJob,
    private readonly setTeamInboxStatusJob: SetTeamInboxStatusJob,
    private readonly syncBroadcastMessageStatsJob: SyncBroadcastMessageStatsJob,
    private readonly syncBusinessQualityHealthJob: SyncBusinessQualityHealthJob,
    private readonly teamInboxJob: TeamInboxJob,
    private readonly triggerTeamInboxChatSocketJob: TriggerTeamInboxChatSocketJob
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
      '605b962f33977ea444d75ec1a98c2a5f': this.actionDetailsJob,
      '16d90291137c2bd33db8ab43fd00bb1d': this.broadcastMessageJob,
      e4404373285ba072d374bc17008b03f1: this.businessJob,
      eb79ef4172c04abb844f0db7978ca0d5: this.businessSettingDetailJob,
      '20bb602509111f21ad8f06d3a03fb5b6': this.businessUserInvitationJob,
      c72593cc969f1871e8fa52361c0b071d: this.businessWebhookEventTriggerJob,
      '1d4310d5e1f8a73a53ff32ee6b7ea5c7': this.chatbotConnectedEdgesJob,
      '4d490ea643c69aeb283ff37ace70ac3b': this.chatbotConnectedNodeJob,
      a446afdb151bdfbfba8c3a9924d5e34c: this.chatbotDetailJob,
      '45562c345f93db21f041c849221c3a9c': this.chatbotFlowJob,
      '89db76ca7a513b871646a74a4b9b3834': this.chatbotFlowNextStepOnExpire,
      '2ec166e2e859a04ffd62a0002565fb55': this.chatbotFlowStepJob,
      acc638242e0fde53e379ec4fa3c55eee: this.chatbotVersionJob,
      ada3a099d7d5c03c989e75a9347f9b04: this.checkSystemHealthJob,
      '45309e1298a33f558708f9937538d3f7': this.clearConversationHistoryJob,
      '48222a5aa6d6be750c48c318b2aee638': this.communicationWhatsappTemplateJob,
      a1c043589bf0b7d056fb51cc9672c03d: this.contactJob,
      b7ae7cc46053abe41f63e517d9e7154c: this.handleAutoAssignToBotJob,
      f225ab09415efacc869342b9f3557431: this.handleFacebookApprovalJob,
      d8fcee06a3fe8bfca0d7afbc790d6f73: this.handleFacebookBusinessAppSyncJob,
      a36a370a3ba14e9164a025913467c2de: this.handleFacebookMessagesJob,
      accda1252c05432958e581906d1675a2: this.handleFacebookWebhookJob,
      a909dd92b6be8e2db430532e23e4db2a: this.handleSendExpiryReminderJob,
      '2345d140d8c2660854849fd4cc7a8051': this.handleWhatsappBusinessAccountJob,
      af335fd11349fd06350bb2bfbf87ed50: this.importBusinessTemplateJob,
      '4b8a3e7a99cac4b1ce5fafa756f43e21': this.keywordActionDetailJob,
      cad0ff16bd2e5cba5eee71ccee96c685: this.keywordActionTriggerDetailJob,
      '80429bf7a2b1dfa78a221d750b446c11': this.keywordDetailJob,
      ce20d57ab8a4f605e5000a6225b0bf32: this.localBulkUploadJob,
      '518a9cebd6b1c6b6238bcfe77983db1e': this.localBusinessUserJob,
      '1ab78bea89d605e9f421a2e974c4ebb6': this.localBusinessWebhookJob,
      c85f33233dc7fb0e735430ecd00c41cc: this.markAsReadJob,
      '49e3e38d8e42f48f2868b067d290cc4a': this.pollSqsQueueJob,
      '7d7281427472f7180f85cb0e98e0fe7e': this.pollWebhookRelaySqsJob,
      '42ae8f5be570b6fb31a3d32cd5e59b76': this.pollWhatsappIncomingMessageJob,
      '178ca9de769e96ee97d72d9762372d53': this.processBroadcastMessageResponseJob,
      '2138b885ef3ab43742d8661c2077a362': this.processBulkUploadJob,
      efd8463ca770d34b8ee26d4724422526: this.processWebhookRelayResponseJob,
      '828fc0ccae03b9f3be1beb610123fd29': this.quickReplyJob,
      '870b9327b5e851cc3706808dc89d485f': this.scheduleBroadcastJob,
      c22809018dd7301d5d454e05bf7d5d96: this.sendPushNotificationJob,
      '68b02d2ee1074f29d5255e67be58e626': this.sendScheduledMessageJob,
      '13025c97583876695447c86e6b040b10': this.sendScheduledMessagesJob,
      '4d53ddc66bc5af9bf3585366482a1704': this.setScheduleBroadcastJob,
      '17f48023726e1e41cb414adc16a071c9': this.setTeamInboxStatusJob,
      cde83408495f2c2afc0578a908bf584f: this.syncBroadcastMessageStatsJob,
      '4f929754bfde3c5a73a81834d993336b': this.syncBusinessQualityHealthJob,
      '9eec356b604480b734bdc23bedc6f80d': this.teamInboxJob,
      a5bbc30bad35a863f4fb5e1ae7efd31c: this.triggerTeamInboxChatSocketJob,
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
