import { SystemRolesConstants } from './constants/system.roles.constants';
import { ActionDetailsController } from './controllers/action.details.controller';
import { BusinessDetailController } from './controllers/business.detail.controller';
import { BusinessSettingDetailController } from './controllers/business.setting.detail.controller';
import { BusinessUserController } from './controllers/business.user.controller';
import { BusinessUserInvitationController } from './controllers/business.user.invitation.controller';
import { ChatbotDetailController } from './controllers/chatbot.detail.controller';
import { ClientSecretConfigController } from './controllers/client.secret.config.controller';
import { CommunicationBusinessWebhookController } from './controllers/communication.business.webhook.controller';
import { CommunicationWhatsappTemplateController } from './controllers/communication.whatsapp.template.controller';
import { ContactController } from './controllers/contact.controller';
import { KeywordDetailController } from './controllers/keyword.detail.controller';
import { LocalBusinessPreferenceController } from './controllers/local.business.preference.controller';
import { MessageController } from './controllers/message.controller';
import { PartnerBusinessController } from './controllers/partner.business.controller';
import { QuickReplyController } from './controllers/quick.reply.controller';
import { ScheduleBroadcastController } from './controllers/schedule.broadcast.controller';
import { TeamInboxController } from './controllers/team.inbox.controller';
import { ActionDetailsAttributesDto } from './dtos/action.details.attributes.dto';
import { ActionDetailsListFilterDto } from './dtos/action.details.list.filter.dto';
import { AddAssigneePayloadDto } from './dtos/add.assignee.payload.dto';
import { AddContactDto } from './dtos/add.contact.dto';
import { AddEnableBotModePayloadDto } from './dtos/add.enable.bot.mode.payload.dto';
import { AddQuickReplyBodyDto } from './dtos/add.quick.reply.body.dto';
import { BroadcastMessageAttributesDto } from './dtos/broadcast.message.attributes.dto';
import { BroadcastMessageListFilterDto } from './dtos/broadcast.message.list.filter.dto';
import { BroadcastMessagePayloadDto } from './dtos/broadcast.message.payload.dto';
import { BusinessAttributesDto } from './dtos/business.attributes.dto';
import { BusinessSettingDetailAttributesDto } from './dtos/business.setting.detail.attributes.dto';
import { BusinessUserInvitationAttributesDto } from './dtos/business.user.invitation.attributes.dto';
import { BusinessUserInvitationDto } from './dtos/business.user.invitation.dto';
import { BusinessUserInvitationListFilterDto } from './dtos/business.user.invitation.list.filter.dto';
import { BusinessUserListFilterDto } from './dtos/business.user.list.filter.dto';
import { ChatbotConnectedEdgesAttributesDto } from './dtos/chatbot.connected.edges.attributes.dto';
import { ChatbotConnectedNodeAttributesDto } from './dtos/chatbot.connected.node.attributes.dto';
import { ChatbotDetailAttributesDto } from './dtos/chatbot.detail.attributes.dto';
import { ChatbotDetailListFilterDto } from './dtos/chatbot.detail.list.filter.dto';
import { ChatbotFlowAttributesDto } from './dtos/chatbot.flow.attributes.dto';
import { ChatbotFlowStepAttributesDto } from './dtos/chatbot.flow.step.attributes.dto';
import { ChatbotRawJsonPayloadDto } from './dtos/chatbot.raw.json.payload.dto';
import { ChatbotVersionAttributesDto } from './dtos/chatbot.version.attributes.dto';
import { CommunicationWhatsappTemplateAttributesDto } from './dtos/communication.whatsapp.template.attributes.dto';
import { CommunicationWhatsappTemplateListFilterDto } from './dtos/communication.whatsapp.template.list.filter.dto';
import { CommunicationWhatsappTemplateSampleDto } from './dtos/communication.whatsapp.template.sample.dto';
import { ContactAttributesDto } from './dtos/contact.attributes.dto';
import { ContactListFilterDto } from './dtos/contact.list.filter.dto';
import { CreateActionDetailDto } from './dtos/create.action.detail.dto';
import { CreateChatbotDetailDto } from './dtos/create.chatbot.detail.dto';
import { CreateChatbotVersionDto } from './dtos/create.chatbot.version.dto';
import { CreateKeywordDetailDto } from './dtos/create.keyword.detail.dto';
import { CreatePartnerBusinessDto } from './dtos/create.partner.business.dto';
import { FacebookSendTemplateMessageDto } from './dtos/facebook.send.template.message.dto';
import { FacebookWebhookEventDto } from './dtos/facebook.webhook.event.dto';
import { HandleFacebookBusinessAppSyncDto } from './dtos/handle.facebook.business.app.sync.dto';
import { IdsPayloadDto } from './dtos/ids.payload.dto';
import { KeywordActionDetailAttributesDto } from './dtos/keyword.action.detail.attributes.dto';
import { KeywordActionTriggerDetailAttributesDto } from './dtos/keyword.action.trigger.detail.attributes.dto';
import { KeywordDetailAttributesDto } from './dtos/keyword.detail.attributes.dto';
import { KeywordDetailListFilterDto } from './dtos/keyword.detail.list.filter.dto';
import { ListMessagePayloadDto } from './dtos/list.message.payload.dto';
import { ProcessCommonListConfigDto } from './dtos/process.common.list.config.dto';
import { QuickReplyAttributesDto } from './dtos/quick.reply.attributes.dto';
import { QuickReplyListFilterDto } from './dtos/quick.reply.list.filter.dto';
import { ScheduleBroadcastAttributesDto } from './dtos/schedule.broadcast.attributes.dto';
import { ScheduleBroadcastDto } from './dtos/schedule.broadcast.dto';
import { ScheduleBroadcastListFilterDto } from './dtos/schedule.broadcast.list.filter.dto';
import { SendTeamInboxMessagePayloadDto } from './dtos/send.team.inbox.message.payload.dto';
import { SetBusinessSettingsDto } from './dtos/set.business.settings.dto';
import { TeamInboxAttributesDto } from './dtos/team.inbox.attributes.dto';
import { TeamInboxListFilterDto } from './dtos/team.inbox.list.filter.dto';
import { TeamInboxUpdateStatusDto } from './dtos/team.inbox.update.status.dto';
import { WhatsappTemplateApprovalDto } from './dtos/whatsapp.template.approval.dto';
import { WhatsappTemplateDto } from './dtos/whatsapp.template.dto';
import { ActionDetailsEntity } from './entities/action.details.entity';
import { BroadcastMessageEntity } from './entities/broadcast.message.entity';
import { BusinessEntity } from './entities/business.entity';
import { BusinessSettingDetailEntity } from './entities/business.setting.detail.entity';
import { BusinessTokenEntity } from './entities/business.token.entity';
import { BusinessUserInvitationEntity } from './entities/business.user.invitation.entity';
import { ChatbotConnectedEdgesEntity } from './entities/chatbot.connected.edges.entity';
import { ChatbotConnectedNodeEntity } from './entities/chatbot.connected.node.entity';
import { ChatbotDetailEntity } from './entities/chatbot.detail.entity';
import { ChatbotFlowEntity } from './entities/chatbot.flow.entity';
import { ChatbotFlowStepEntity } from './entities/chatbot.flow.step.entity';
import { ChatbotVersionEntity } from './entities/chatbot.version.entity';
import { CommunicationApiAccountEntity } from './entities/communication.api.account.entity';
import { CommunicationBusinessUserEntity } from './entities/communication.business.user.entity';
import { CommunicationWhatsappTemplateEntity } from './entities/communication.whatsapp.template.entity';
import { ContactEntity } from './entities/contact.entity';
import { KeywordActionDetailEntity } from './entities/keyword.action.detail.entity';
import { KeywordActionTriggerDetailEntity } from './entities/keyword.action.trigger.detail.entity';
import { KeywordDetailEntity } from './entities/keyword.detail.entity';
import { QuickReplyEntity } from './entities/quick.reply.entity';
import { ScheduleBroadcastEntity } from './entities/schedule.broadcast.entity';
import { TeamInboxEntity } from './entities/team.inbox.entity';
import { ActionTypeEnum } from './enums/action.type.enum';
import { BulkUploadTypeEnum } from './enums/bulk.upload.type.enum';
import { ChatbotNodesIdentifierConstants } from './enums/chatbot.nodes.identifier.constants';
import { KeywordMatchingTypeEnum } from './enums/keyword.matching.type.enum';
import { MessageStatusEnum } from './enums/message.status.enum';
import { SystemScriptTypeEnum } from './enums/system.script.type.enum';
import { TeamInboxStatusTypeEnum } from './enums/team.inbox.status.type.enum';
import { WhatsappTemplateCategoryEnum } from './enums/whatsapp.template.category.enum';
import { WhatsappTemplateStatusEnum } from './enums/whatsapp.template.status.enum';
import { ActionDetailsJob } from './jobs/action.details.job';
import { BroadcastMessageJob } from './jobs/broadcast.message.job';
import { BusinessJob } from './jobs/business.job';
import { BusinessSettingDetailJob } from './jobs/business.setting.detail.job';
import { BusinessUserInvitationJob } from './jobs/business.user.invitation.job';
import { BusinessWebhookEventTriggerJob } from './jobs/business.webhook.event.trigger.job';
import { ChatbotConnectedEdgesJob } from './jobs/chatbot.connected.edges.job';
import { ChatbotConnectedNodeJob } from './jobs/chatbot.connected.node.job';
import { ChatbotDetailJob } from './jobs/chatbot.detail.job';
import { ChatbotFlowJob } from './jobs/chatbot.flow.job';
import { ChatbotFlowNextStepOnExpire } from './jobs/chatbot.flow.next.step.on.expire';
import { ChatbotFlowStepJob } from './jobs/chatbot.flow.step.job';
import { ChatbotVersionJob } from './jobs/chatbot.version.job';
import { CheckSystemHealthJob } from './jobs/check.system.health.job';
import { ClearConversationHistoryJob } from './jobs/clear.conversation.history.job';
import { CommunicationWhatsappTemplateJob } from './jobs/communication.whatsapp.template.job';
import { ContactJob } from './jobs/contact.job';
import { HandleAutoAssignToBotJob } from './jobs/handle.auto.assign.to.bot.job';
import { HandleFacebookApprovalJob } from './jobs/handle.facebook.approval.job';
import { HandleFacebookBusinessAppSyncJob } from './jobs/handle.facebook.business.app.sync.job';
import { HandleFacebookMessagesJob } from './jobs/handle.facebook.messages.job';
import { HandleFacebookWebhookJob } from './jobs/handle.facebook.webhook.job';
import { HandleSendExpiryReminderJob } from './jobs/handle.send.expiry.reminder.job';
import { HandleWhatsappBusinessAccountJob } from './jobs/handle.whatsapp.business.account.job';
import { ImportBusinessTemplateJob } from './jobs/import.business.template.job';
import { KeywordActionDetailJob } from './jobs/keyword.action.detail.job';
import { KeywordActionTriggerDetailJob } from './jobs/keyword.action.trigger.detail.job';
import { KeywordDetailJob } from './jobs/keyword.detail.job';
import { LocalBulkUploadJob } from './jobs/local.bulk.upload.job';
import { LocalBusinessUserJob } from './jobs/local.business.user..job';
import { LocalBusinessWebhookJob } from './jobs/local.business.webhook.job';
import { MarkAsReadJob } from './jobs/mark.as.read.job';
import { PollSqsQueueJob } from './jobs/poll.sqs.queue.job';
import { PollWebhookRelaySqsJob } from './jobs/poll.webhook.relay.sqs.job';
import { PollWhatsappIncomingMessageJob } from './jobs/poll.whatsapp.incoming.message.job';
import { ProcessBroadcastMessageResponseJob } from './jobs/process.broadcast.message.response.job';
import { ProcessBulkUploadJob } from './jobs/process.bulk.upload.job';
import { ProcessWebhookRelayResponseJob } from './jobs/process.webhook.relay.response.job';
import { QuickReplyJob } from './jobs/quick.reply.job';
import { ScheduleBroadcastJob } from './jobs/schedule.broadcast.job';
import { SendPushNotificationJob } from './jobs/send.push.notification.job';
import { SendScheduledMessageJob } from './jobs/send.scheduled.message.job';
import { SendScheduledMessagesJob } from './jobs/send.scheduled.messages.job';
import { SetScheduleBroadcastJob } from './jobs/set.schedule.broadcast.job';
import { SetTeamInboxStatusJob } from './jobs/set.team.inbox.status.job';
import { SyncBroadcastMessageStatsJob } from './jobs/sync.broadcast.message.stats.job';
import { SyncBusinessQualityHealthJob } from './jobs/sync.business.quality.health.job';
import { TeamInboxJob } from './jobs/team.inbox.job';
import { TriggerTeamInboxChatSocketJob } from './jobs/trigger.team.inbox.chat.socket.job';
import { CommonBulkUpload } from './libraries/common.bulk.upload';
import { CreateBroadcastMessagePayload } from './libraries/create.broadcast.message.payload';
import { CreateWhatsappBroadcastTemplateCsv } from './libraries/create.whatsapp.broadcast.template.csv';
import { ProcessActionDetailsList } from './libraries/process.action.details.list';
import { ProcessApiAccountData } from './libraries/process.api.account.data';
import { ProcessBroadcastMessageList } from './libraries/process.broadcast.message.list';
import { ProcessBusinessUserInvitationList } from './libraries/process.business.user.invitation.list';
import { ProcessBusinessUserList } from './libraries/process.business.user.list';
import { ProcessChatbotDetailList } from './libraries/process.chatbot.detail.list';
import { ProcessCommunicationTemplate } from './libraries/process.communication.template';
import { ProcessContactList } from './libraries/process.contact.list';
import { ProcessContactsBulkUpload } from './libraries/process.contacts.bulk.upload';
import { ProcessCreateActionDetail } from './libraries/process.create.action.detail';
import { ProcessCreateKeywordDetails } from './libraries/process.create.keyword.details';
import { ProcessCreateQuickReply } from './libraries/process.create.quick.reply';
import { ProcessKeywordDetailList } from './libraries/process.keyword.detail.list';
import { ProcessPartnerAccountBusinessList } from './libraries/process.partner.account.business.list';
import { ProcessQuickReplyList } from './libraries/process.quick.reply.list';
import { ProcessScheduleBroadcast } from './libraries/process.schedule.broadcast.';
import { ProcessScheduleBroadcastList } from './libraries/process.schedule.broadcast.list';
import { ProcessScheduledCsvData } from './libraries/process.scheduled.csv.data';
import { ProcessSendTeamInboxMessage } from './libraries/process.send.team.inbox.message';
import { ProcessSendTemplateMessage } from './libraries/process.send.template.message';
import { ProcessSendWebhookEvent } from './libraries/process.send.webhook.event';
import { ProcessSetChatFlowNextStep } from './libraries/process.set.chat.flow.next.step';
import { ProcessSetChatbotFlow } from './libraries/process.set.chatbot.flow';
import { ProcessSetRawChatbotDetailData } from './libraries/process.set.raw.chatbot.detail.data';
import { ProcessTeamInboxList } from './libraries/process.team.inbox.list';
import { ProcessTeamInboxMessageList } from './libraries/process.team.inbox.message.list';
import { ProcessTriggerChatbotFlow } from './libraries/process.trigger.chatbot.flow';
import { ProcessWhatsappTemplateList } from './libraries/process.whatsapp.template.list';
import { SendWebhookRequest } from './libraries/send.webhook.request';
import { TemplateCreationDuplicateVariableProcessor } from './libraries/template.creation.duplicate.variable.processor';
import { TriggerKeywordAction } from './libraries/trigger.keyword.action';
import { BroadcastMessageService } from './services/broadcast.message.service';
import { BusinessAccessService } from './services/business.access.service';
import { BusinessSettingsService } from './services/business.settings.service';
import { BusinessUserService } from './services/business.user.service';
import { ChatbotFlowService } from './services/chatbot.flow.service';
import { ContactService } from './services/contact.service';
import { Es6JobsService } from './services/es6.jobs.service';
import { FacebookInternalMessageService } from './services/facebook.internal.message.service';
import { FacebookInternalService } from './services/facebook.internal.service';
import { FacebookInternalTemplateService } from './services/facebook.internal.template.service';
import { InteractiveMessageService } from './services/interactive.message.service';
import { MessageGateway } from './services/message.gateway';
import { PartnerBusinessService } from './services/partner.business.service';
import { TeamInboxService } from './services/team.inbox.service';
import { TriggerAutomationActionService } from './services/trigger.automation.action.service';
import { WebhookService } from './services/webhook.service';
import { ActionDetailsSubscriber } from './subscribers/action.details.subscriber';
import { BroadcastMessageSubscriber } from './subscribers/broadcast.message.subscriber';
import { BulkUploadSubscriber } from './subscribers/bulk.upload.subscriber';
import { BusinessSettingDetailSubscriber } from './subscribers/business.setting.detail.subscriber';
import { BusinessSubscriber } from './subscribers/business.subscriber';
import { BusinessUserInvitationSubscriber } from './subscribers/business.user.invitation.subscriber';
import { ChatbotConnectedEdgesSubscriber } from './subscribers/chatbot.connected.edges.subscriber';
import { ChatbotConnectedNodeSubscriber } from './subscribers/chatbot.connected.node.subscriber';
import { ChatbotDetailSubscriber } from './subscribers/chatbot.detail.subscriber';
import { ChatbotFlowStepSubscriber } from './subscribers/chatbot.flow.step.subscriber';
import { ChatbotFlowSubscriber } from './subscribers/chatbot.flow.subscriber';
import { ChatbotVersionSubscriber } from './subscribers/chatbot.version.subscriber';
import { CommunicationWhatsappTemplateSubscriber } from './subscribers/communication.whatsapp.template.subscriber';
import { ContactSubscriber } from './subscribers/contact.subscriber';
import { KeywordActionDetailSubscriber } from './subscribers/keyword.action.detail.subscriber';
import { KeywordActionTriggerDetailSubscriber } from './subscribers/keyword.action.trigger.detail.subscriber';
import { KeywordDetailSubscriber } from './subscribers/keyword.detail.subscriber';
import { LocalBusinessUserSubscriber } from './subscribers/local.business.user.subscriber';
import { LocalBusinessWebhookSubscriber } from './subscribers/local.business.webhook.subscriber';
import { QuickReplySubscriber } from './subscribers/quick.reply.subscriber';
import { ScheduleBroadcastSubscriber } from './subscribers/schedule.broadcast.subscriber';
import { TeamInboxSubscriber } from './subscribers/team.inbox.subscriber';

const es6Classes = {
  constants: [SystemRolesConstants],
  controllers: [
    ActionDetailsController,
    BusinessDetailController,
    BusinessSettingDetailController,
    BusinessUserController,
    BusinessUserInvitationController,
    ChatbotDetailController,
    ClientSecretConfigController,
    CommunicationBusinessWebhookController,
    CommunicationWhatsappTemplateController,
    ContactController,
    KeywordDetailController,
    LocalBusinessPreferenceController,
    MessageController,
    PartnerBusinessController,
    QuickReplyController,
    ScheduleBroadcastController,
    TeamInboxController,
  ],
  dtos: [
    ActionDetailsAttributesDto,
    ActionDetailsListFilterDto,
    AddAssigneePayloadDto,
    AddContactDto,
    AddEnableBotModePayloadDto,
    AddQuickReplyBodyDto,
    BroadcastMessageAttributesDto,
    BroadcastMessageListFilterDto,
    BroadcastMessagePayloadDto,
    BusinessAttributesDto,
    BusinessSettingDetailAttributesDto,
    BusinessUserInvitationAttributesDto,
    BusinessUserInvitationDto,
    BusinessUserInvitationListFilterDto,
    BusinessUserListFilterDto,
    ChatbotConnectedEdgesAttributesDto,
    ChatbotConnectedNodeAttributesDto,
    ChatbotDetailAttributesDto,
    ChatbotDetailListFilterDto,
    ChatbotFlowAttributesDto,
    ChatbotFlowStepAttributesDto,
    ChatbotRawJsonPayloadDto,
    ChatbotVersionAttributesDto,
    CommunicationWhatsappTemplateAttributesDto,
    CommunicationWhatsappTemplateListFilterDto,
    CommunicationWhatsappTemplateSampleDto,
    ContactAttributesDto,
    ContactListFilterDto,
    CreateActionDetailDto,
    CreateChatbotDetailDto,
    CreateChatbotVersionDto,
    CreateKeywordDetailDto,
    CreatePartnerBusinessDto,
    FacebookSendTemplateMessageDto,
    FacebookWebhookEventDto,
    HandleFacebookBusinessAppSyncDto,
    IdsPayloadDto,
    KeywordActionDetailAttributesDto,
    KeywordActionTriggerDetailAttributesDto,
    KeywordDetailAttributesDto,
    KeywordDetailListFilterDto,
    ListMessagePayloadDto,
    ProcessCommonListConfigDto,
    QuickReplyAttributesDto,
    QuickReplyListFilterDto,
    ScheduleBroadcastAttributesDto,
    ScheduleBroadcastDto,
    ScheduleBroadcastListFilterDto,
    SendTeamInboxMessagePayloadDto,
    SetBusinessSettingsDto,
    TeamInboxAttributesDto,
    TeamInboxListFilterDto,
    TeamInboxUpdateStatusDto,
    WhatsappTemplateApprovalDto,
    WhatsappTemplateDto,
  ],
  entities: [
    ActionDetailsEntity,
    BroadcastMessageEntity,
    BusinessEntity,
    BusinessSettingDetailEntity,
    BusinessTokenEntity,
    BusinessUserInvitationEntity,
    ChatbotConnectedEdgesEntity,
    ChatbotConnectedNodeEntity,
    ChatbotDetailEntity,
    ChatbotFlowEntity,
    ChatbotFlowStepEntity,
    ChatbotVersionEntity,
    CommunicationApiAccountEntity,
    CommunicationBusinessUserEntity,
    CommunicationWhatsappTemplateEntity,
    ContactEntity,
    KeywordActionDetailEntity,
    KeywordActionTriggerDetailEntity,
    KeywordDetailEntity,
    QuickReplyEntity,
    ScheduleBroadcastEntity,
    TeamInboxEntity,
  ],
  enums: [
    ActionTypeEnum,
    BulkUploadTypeEnum,
    ChatbotNodesIdentifierConstants,
    KeywordMatchingTypeEnum,
    MessageStatusEnum,
    SystemScriptTypeEnum,
    TeamInboxStatusTypeEnum,
    WhatsappTemplateCategoryEnum,
    WhatsappTemplateStatusEnum,
  ],
  jobs: [
    ActionDetailsJob,
    BroadcastMessageJob,
    BusinessJob,
    BusinessSettingDetailJob,
    BusinessUserInvitationJob,
    BusinessWebhookEventTriggerJob,
    ChatbotConnectedEdgesJob,
    ChatbotConnectedNodeJob,
    ChatbotDetailJob,
    ChatbotFlowJob,
    ChatbotFlowNextStepOnExpire,
    ChatbotFlowStepJob,
    ChatbotVersionJob,
    CheckSystemHealthJob,
    ClearConversationHistoryJob,
    CommunicationWhatsappTemplateJob,
    ContactJob,
    HandleAutoAssignToBotJob,
    HandleFacebookApprovalJob,
    HandleFacebookBusinessAppSyncJob,
    HandleFacebookMessagesJob,
    HandleFacebookWebhookJob,
    HandleSendExpiryReminderJob,
    HandleWhatsappBusinessAccountJob,
    ImportBusinessTemplateJob,
    KeywordActionDetailJob,
    KeywordActionTriggerDetailJob,
    KeywordDetailJob,
    LocalBulkUploadJob,
    LocalBusinessUserJob,
    LocalBusinessWebhookJob,
    MarkAsReadJob,
    PollSqsQueueJob,
    PollWebhookRelaySqsJob,
    PollWhatsappIncomingMessageJob,
    ProcessBroadcastMessageResponseJob,
    ProcessBulkUploadJob,
    ProcessWebhookRelayResponseJob,
    QuickReplyJob,
    ScheduleBroadcastJob,
    SendPushNotificationJob,
    SendScheduledMessageJob,
    SendScheduledMessagesJob,
    SetScheduleBroadcastJob,
    SetTeamInboxStatusJob,
    SyncBroadcastMessageStatsJob,
    SyncBusinessQualityHealthJob,
    TeamInboxJob,
    TriggerTeamInboxChatSocketJob,
  ],
  libraries: [
    CommonBulkUpload,
    CreateBroadcastMessagePayload,
    CreateWhatsappBroadcastTemplateCsv,
    ProcessActionDetailsList,
    ProcessApiAccountData,
    ProcessBroadcastMessageList,
    ProcessBusinessUserInvitationList,
    ProcessBusinessUserList,
    ProcessChatbotDetailList,
    ProcessCommunicationTemplate,
    ProcessContactList,
    ProcessContactsBulkUpload,
    ProcessCreateActionDetail,
    ProcessCreateKeywordDetails,
    ProcessCreateQuickReply,
    ProcessKeywordDetailList,
    ProcessPartnerAccountBusinessList,
    ProcessQuickReplyList,
    ProcessScheduleBroadcast,
    ProcessScheduleBroadcastList,
    ProcessScheduledCsvData,
    ProcessSendTeamInboxMessage,
    ProcessSendTemplateMessage,
    ProcessSendWebhookEvent,
    ProcessSetChatFlowNextStep,
    ProcessSetChatbotFlow,
    ProcessSetRawChatbotDetailData,
    ProcessTeamInboxList,
    ProcessTeamInboxMessageList,
    ProcessTriggerChatbotFlow,
    ProcessWhatsappTemplateList,
    SendWebhookRequest,
    TemplateCreationDuplicateVariableProcessor,
    TriggerKeywordAction,
  ],
  services: [
    BroadcastMessageService,
    BusinessAccessService,
    BusinessSettingsService,
    BusinessUserService,
    ChatbotFlowService,
    ContactService,
    Es6JobsService,
    FacebookInternalMessageService,
    FacebookInternalService,
    FacebookInternalTemplateService,
    InteractiveMessageService,
    MessageGateway,
    PartnerBusinessService,
    TeamInboxService,
    TriggerAutomationActionService,
    WebhookService,
  ],
  subscribers: [
    ActionDetailsSubscriber,
    BroadcastMessageSubscriber,
    BulkUploadSubscriber,
    BusinessSettingDetailSubscriber,
    BusinessSubscriber,
    BusinessUserInvitationSubscriber,
    ChatbotConnectedEdgesSubscriber,
    ChatbotConnectedNodeSubscriber,
    ChatbotDetailSubscriber,
    ChatbotFlowStepSubscriber,
    ChatbotFlowSubscriber,
    ChatbotVersionSubscriber,
    CommunicationWhatsappTemplateSubscriber,
    ContactSubscriber,
    KeywordActionDetailSubscriber,
    KeywordActionTriggerDetailSubscriber,
    KeywordDetailSubscriber,
    LocalBusinessUserSubscriber,
    LocalBusinessWebhookSubscriber,
    QuickReplySubscriber,
    ScheduleBroadcastSubscriber,
    TeamInboxSubscriber,
  ],
};

export default es6Classes;
