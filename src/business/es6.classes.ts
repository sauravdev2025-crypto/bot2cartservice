import { BusinessDetailController } from './controllers/business.detail.controller';
import { BusinessSettingDetailController } from './controllers/business.setting.detail.controller';
import { BusinessUserController } from './controllers/business.user.controller';
import { BusinessUserInvitationController } from './controllers/business.user.invitation.controller';
import { ClientSecretConfigController } from './controllers/client.secret.config.controller';
import { CommunicationBusinessWebhookController } from './controllers/communication.business.webhook.controller';
import { LocalBusinessPreferenceController } from './controllers/local.business.preference.controller';
import { PartnerBusinessController } from './controllers/partner.business.controller';
import { AddAssigneePayloadDto } from './dtos/add.assignee.payload.dto';
import { BusinessAttributesDto } from './dtos/business.attributes.dto';
import { BusinessSettingDetailAttributesDto } from './dtos/business.setting.detail.attributes.dto';
import { BusinessUserInvitationAttributesDto } from './dtos/business.user.invitation.attributes.dto';
import { BusinessUserInvitationDto } from './dtos/business.user.invitation.dto';
import { BusinessUserInvitationListFilterDto } from './dtos/business.user.invitation.list.filter.dto';
import { BusinessUserListFilterDto } from './dtos/business.user.list.filter.dto';
import { CreatePartnerBusinessDto } from './dtos/create.partner.business.dto';
import { IdsPayloadDto } from './dtos/ids.payload.dto';
import { ProcessCommonListConfigDto } from './dtos/process.common.list.config.dto';
import { SetBusinessSettingsDto } from './dtos/set.business.settings.dto';
import { BusinessEntity } from './entities/business.entity';
import { BusinessSettingDetailEntity } from './entities/business.setting.detail.entity';
import { BusinessTokenEntity } from './entities/business.token.entity';
import { BusinessUserInvitationEntity } from './entities/business.user.invitation.entity';
import { CommunicationApiAccountEntity } from './entities/communication.api.account.entity';
import { CommunicationBusinessUserEntity } from './entities/communication.business.user.entity';
import { BulkUploadTypeEnum } from './enums/bulk.upload.type.enum';
import { SystemScriptTypeEnum } from './enums/system.script.type.enum';
import { BusinessJob } from './jobs/business.job';
import { BusinessSettingDetailJob } from './jobs/business.setting.detail.job';
import { BusinessUserInvitationJob } from './jobs/business.user.invitation.job';
import { LocalBulkUploadJob } from './jobs/local.bulk.upload.job';
import { LocalBusinessUserJob } from './jobs/local.business.user..job';
import { LocalBusinessWebhookJob } from './jobs/local.business.webhook.job';
import { ProcessBulkUploadJob } from './jobs/process.bulk.upload.job';
import { ProcessWebhookRelayResponseJob } from './jobs/process.webhook.relay.response.job';
import { CommonBulkUpload } from './libraries/common.bulk.upload';
import { ProcessApiAccountData } from './libraries/process.api.account.data';
import { ProcessBusinessUserInvitationList } from './libraries/process.business.user.invitation.list';
import { ProcessBusinessUserList } from './libraries/process.business.user.list';
import { ProcessPartnerAccountBusinessList } from './libraries/process.partner.account.business.list';
import { SendWebhookRequest } from './libraries/send.webhook.request';
import { BusinessAccessService } from './services/business.access.service';
import { BusinessSettingsService } from './services/business.settings.service';
import { BusinessUserService } from './services/business.user.service';
import { Es6JobsService } from './services/es6.jobs.service';
import { Es6Service } from './services/es6.service';
import { MessageGateway } from './services/message.gateway';
import { PartnerBusinessService } from './services/partner.business.service';
import { WebhookService } from './services/webhook.service';
import { BulkUploadSubscriber } from './subscribers/bulk.upload.subscriber';
import { BusinessSettingDetailSubscriber } from './subscribers/business.setting.detail.subscriber';
import { BusinessSubscriber } from './subscribers/business.subscriber';
import { BusinessUserInvitationSubscriber } from './subscribers/business.user.invitation.subscriber';
import { LocalBusinessUserSubscriber } from './subscribers/local.business.user.subscriber';
import { LocalBusinessWebhookSubscriber } from './subscribers/local.business.webhook.subscriber';

const es6Classes = {
  constants: [],
  controllers: [
    BusinessDetailController,
    BusinessSettingDetailController,
    BusinessUserController,
    BusinessUserInvitationController,
    ClientSecretConfigController,
    CommunicationBusinessWebhookController,
    LocalBusinessPreferenceController,
    PartnerBusinessController,
  ],
  dtos: [
    AddAssigneePayloadDto,
    BusinessAttributesDto,
    BusinessSettingDetailAttributesDto,
    BusinessUserInvitationAttributesDto,
    BusinessUserInvitationDto,
    BusinessUserInvitationListFilterDto,
    BusinessUserListFilterDto,
    CreatePartnerBusinessDto,
    IdsPayloadDto,
    ProcessCommonListConfigDto,
    SetBusinessSettingsDto,
  ],
  entities: [
    BusinessEntity,
    BusinessSettingDetailEntity,
    BusinessTokenEntity,
    BusinessUserInvitationEntity,
    CommunicationApiAccountEntity,
    CommunicationBusinessUserEntity,
  ],
  enums: [BulkUploadTypeEnum, SystemScriptTypeEnum],
  jobs: [
    BusinessJob,
    BusinessSettingDetailJob,
    BusinessUserInvitationJob,
    LocalBulkUploadJob,
    LocalBusinessUserJob,
    LocalBusinessWebhookJob,
    ProcessBulkUploadJob,
    ProcessWebhookRelayResponseJob,
  ],
  libraries: [
    CommonBulkUpload,
    ProcessApiAccountData,
    ProcessBusinessUserInvitationList,
    ProcessBusinessUserList,
    ProcessPartnerAccountBusinessList,
    SendWebhookRequest,
  ],
  services: [
    BusinessAccessService,
    BusinessSettingsService,
    BusinessUserService,
    Es6JobsService,
    Es6Service,
    MessageGateway,
    PartnerBusinessService,
    WebhookService,
  ],
  subscribers: [
    BulkUploadSubscriber,
    BusinessSettingDetailSubscriber,
    BusinessSubscriber,
    BusinessUserInvitationSubscriber,
    LocalBusinessUserSubscriber,
    LocalBusinessWebhookSubscriber,
  ],
};

export default es6Classes;
