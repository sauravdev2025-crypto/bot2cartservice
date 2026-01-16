import { AuthController } from './controllers/auth.controller';
import { BulkUploadController } from './controllers/bulk.upload.controller';
import { BusinessController } from './controllers/business.controller';
import { ChatbotNodesController } from './controllers/chatbot.nodes.controller';
import { LoggedUtilityController } from './controllers/logged.utility.controller';
import { UserController } from './controllers/user.controller';
import { WebhookController } from './controllers/webhook.controller';
import { BusinessOnboardingPayloadDto } from './dtos/business.onboarding.payload.dto';
import { ChatbotNodesAttributesDto } from './dtos/chatbot.nodes.attributes.dto';
import { ChatbotNodesListFilterDto } from './dtos/chatbot.nodes.list.filter.dto';
import { CommentCreationDto } from './dtos/comment.creation.dto';
import { CommunicationUserAttributesDto } from './dtos/communication.user.attributes.dto';
import { EmailVerificationDto } from './dtos/email.verification.dto';
import { FacebookInternalLogAttributesDto } from './dtos/facebook.internal.log.attributes.dto';
import { ForgetPasswordPayloadDto } from './dtos/forget.password.payload.dto';
import { IdentifierSerialAttributesDto } from './dtos/identifier.serial.attributes.dto';
import { LoginPayloadDto } from './dtos/login.payload.dto';
import { LoginResponseDto } from './dtos/login.response.dto';
import { SignupPayloadDto } from './dtos/signup.payload.dto';
import { SystemLanguageAttributesDto } from './dtos/system.language.attributes.dto';
import { UserProfileDto } from './dtos/user.profile.dto';
import { ChatbotNodesEntity } from './entities/chatbot.nodes.entity';
import { CommunicationUserEntity } from './entities/communication.user.entity';
import { FacebookInternalLogEntity } from './entities/facebook.internal.log.entity';
import { IdentifierSerialEntity } from './entities/identifier.serial.entity';
import { SystemLanguageEntity } from './entities/system.language.entity';
import { UserActivityEntity } from './entities/user.activity.entity';
import { CommentTypeEnum } from './enums/comment.type.enum';
import { IdentifierSerialsTypeEnum } from './enums/identifier.serials.type.enum';
import { ChatbotNodesJob } from './jobs/chatbot.nodes.job';
import { CommunicationUserJob } from './jobs/communication.user.job';
import { FacebookInternalLogJob } from './jobs/facebook.internal.log.job';
import { IdentifierSerialJob } from './jobs/identifier.serial.job';
import { LocalCommentJob } from './jobs/local.comment.job';
import { ProcessCommonFileJob } from './jobs/process.common.file.job';
import { SendForgetPasswordEmailJob } from './jobs/send.forget.password.email.job';
import { StartBusinessChatSyncJob } from './jobs/start.business.chat.sync.job';
import { SystemLanguageJob } from './jobs/system.language.job';
import { VerifyEmailJob } from './jobs/verify.email.job';
import { VerifyMobileJob } from './jobs/verify.mobile.job';
import { CommentDocumentController } from './libraries/comment.document.controller';
import { ConversationController } from './libraries/conversation.controller';
import { GenerateBulkUploadSheet } from './libraries/generate.bulk.upload.sheet';
import { ProcessChatbotNodesList } from './libraries/process.chatbot.nodes.list';
import { ProcessCommunicationList } from './libraries/process.communication.list';
import { ProcessConversationData } from './libraries/process.conversation.data';
import { ProcessDbFind } from './libraries/process.db.find';
import { ProcessTransformApiResponse } from './libraries/process.transform.api.response';
import { BusinessMetaIntegrationService } from './services/business.meta.integration.service';
import { BusinessService } from './services/business.service';
import { Es6JobsService } from './services/es6.jobs.service';
import { FileUploadService } from './services/file.upload.service';
import { IdentifierGeneratorService } from './services/identifier.generator.service';
import { LocalSqsService } from './services/local.sqs.service';
import { LoginService } from './services/login.service';
import { MobileValidationService } from './services/mobile.validation.service';
import { SendFcmNotification } from './services/send.fcm.notification';
import { SignupService } from './services/signup.service';
import { UserActivityService } from './services/user.activity.service';
import { ChatbotNodesSubscriber } from './subscribers/chatbot.nodes.subscriber';
import { CommunicationUserSubscriber } from './subscribers/communication.user.subscriber';
import { FacebookInternalLogSubscriber } from './subscribers/facebook.internal.log.subscriber';
import { IdentifierSerialSubscriber } from './subscribers/identifier.serial.subscriber';
import { SystemLanguageSubscriber } from './subscribers/system.language.subscriber';

const es6Classes = {
  controllers: [
    AuthController,
    BulkUploadController,
    BusinessController,
    ChatbotNodesController,
    LoggedUtilityController,
    UserController,
    WebhookController,
  ],
  dtos: [
    BusinessOnboardingPayloadDto,
    ChatbotNodesAttributesDto,
    ChatbotNodesListFilterDto,
    CommentCreationDto,
    CommunicationUserAttributesDto,
    EmailVerificationDto,
    FacebookInternalLogAttributesDto,
    ForgetPasswordPayloadDto,
    IdentifierSerialAttributesDto,
    LoginPayloadDto,
    LoginResponseDto,
    SignupPayloadDto,
    SystemLanguageAttributesDto,
    UserProfileDto,
  ],
  entities: [
    ChatbotNodesEntity,
    CommunicationUserEntity,
    FacebookInternalLogEntity,
    IdentifierSerialEntity,
    SystemLanguageEntity,
    UserActivityEntity,
  ],
  enums: [CommentTypeEnum, IdentifierSerialsTypeEnum],
  jobs: [
    ChatbotNodesJob,
    CommunicationUserJob,
    FacebookInternalLogJob,
    IdentifierSerialJob,
    LocalCommentJob,
    ProcessCommonFileJob,
    SendForgetPasswordEmailJob,
    StartBusinessChatSyncJob,
    SystemLanguageJob,
    VerifyEmailJob,
    VerifyMobileJob,
  ],
  libraries: [
    CommentDocumentController,
    ConversationController,
    GenerateBulkUploadSheet,
    ProcessChatbotNodesList,
    ProcessCommunicationList,
    ProcessConversationData,
    ProcessDbFind,
    ProcessTransformApiResponse,
  ],
  services: [
    BusinessMetaIntegrationService,
    BusinessService,
    Es6JobsService,
    FileUploadService,
    IdentifierGeneratorService,
    LocalSqsService,
    LoginService,
    MobileValidationService,
    SendFcmNotification,
    SignupService,
    UserActivityService,
  ],
  subscribers: [
    ChatbotNodesSubscriber,
    CommunicationUserSubscriber,
    FacebookInternalLogSubscriber,
    IdentifierSerialSubscriber,
    SystemLanguageSubscriber,
  ],
};

export default es6Classes;
