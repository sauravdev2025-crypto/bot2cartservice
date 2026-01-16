import { ExternalApiAsyncMessageController } from './controllers/external.api.async.message.controller';
import { ExternalApiContactController } from './controllers/external.api.contact.controller';
import { ExternalApiController } from './controllers/external.api.controller';
import { ExternalApiMessageController } from './controllers/external.api.message.controller';
import { ExternalApiTemplateController } from './controllers/external.api.template.controller';
import { ExternalPartnerApiController } from './controllers/external.partner.api.controller';
import { ExternalAddContactDto } from './dtos/external.add.contact.dto';
import { ExternalApiAccountResponseDto } from './dtos/external.api.account.response.dto';
import { ExternalApiLogAttributesDto } from './dtos/external.api.log.attributes.dto';
import { ExternalBatchAddContactDto } from './dtos/external.batch.add.contact.dto';
import { ExternalBatchUpdateContactDto } from './dtos/external.batch.update.contact.dto';
import { ExternalBusinessResponseDto } from './dtos/external.business.response.dto';
import { ExternalContactInboxListFilterDto } from './dtos/external.contact.inbox.list.filter.dto';
import { ExternalCreateBusinessDto } from './dtos/external.create.business.dto';
import { ExternalGetTemplatesListFilterDto } from './dtos/external.get.templates.list.filter.dto';
import { ExternalListFilterDto } from './dtos/external.list.filter.dto';
import { ExternalSetContactDto } from './dtos/external.set.contact.dto';
import { ExternalSetContactManagerDto } from './dtos/external.set.contact.manager.dto';
import { ExternalSetTemplateDto } from './dtos/external.set.template.dto';
import { ExternalValidationUrlDto } from './dtos/external.validation.url.dto';
import { GenerateClientSecretDto } from './dtos/generate.client.secret.dto';
import { SendExternalTemplateMessagePayloadDto } from './dtos/send.external.template.message.payload.dto';
import { ExternalApiLogEntity } from './entities/external.api.log.entity';
import { ExternalApiLogJob } from './jobs/external.api.log.job';
import { ProcessSendExternalListMessage } from './libraries/process.send.external.list.message';
import { ProcessSendExternalNormalMessage } from './libraries/process.send.external.normal.message';
import { ProcessSendExternalTemplateMessage } from './libraries/process.send.external.template.message';
import { Es6JobsService } from './services/es6.jobs.service';
import { ExternalAccessMiddlewareService } from './services/external.access.middleware.service';
import { ExternalAccessService } from './services/external.access.service';
import { ExternalContactService } from './services/external.contact.service';
import { ExternalMessageService } from './services/external.message.service';
import { ExternalPartnerService } from './services/external.partner.service';
import { ExternalTransformerService } from './services/external.transformer.service';
import { ExternalApiLogSubscriber } from './subscribers/external.api.log.subscriber';
import { WhatsappContactTransformerListConstant } from './transformer_constant/whatsapp.contact.transformer.list.constant';
import { WhatsappInboxTransformerListConstant } from './transformer_constant/whatsapp.inbox.transformer.list.constant';
import { WhatsappTemplateTransformerListConstant } from './transformer_constant/whatsapp.template.transformer.list.constant';

const es6Classes = {
  controllers: [
    ExternalApiAsyncMessageController,
    ExternalApiContactController,
    ExternalApiController,
    ExternalApiMessageController,
    ExternalApiTemplateController,
    ExternalPartnerApiController,
  ],
  dtos: [
    ExternalAddContactDto,
    ExternalApiAccountResponseDto,
    ExternalApiLogAttributesDto,
    ExternalBatchAddContactDto,
    ExternalBatchUpdateContactDto,
    ExternalBusinessResponseDto,
    ExternalContactInboxListFilterDto,
    ExternalCreateBusinessDto,
    ExternalGetTemplatesListFilterDto,
    ExternalListFilterDto,
    ExternalSetContactDto,
    ExternalSetContactManagerDto,
    ExternalSetTemplateDto,
    ExternalValidationUrlDto,
    GenerateClientSecretDto,
    SendExternalTemplateMessagePayloadDto,
  ],
  entities: [ExternalApiLogEntity],
  jobs: [ExternalApiLogJob],
  libraries: [ProcessSendExternalListMessage, ProcessSendExternalNormalMessage, ProcessSendExternalTemplateMessage],
  services: [
    Es6JobsService,
    ExternalAccessMiddlewareService,
    ExternalAccessService,
    ExternalContactService,
    ExternalMessageService,
    ExternalPartnerService,
    ExternalTransformerService,
  ],
  subscribers: [ExternalApiLogSubscriber],
  transformer_constant: [WhatsappContactTransformerListConstant, WhatsappInboxTransformerListConstant, WhatsappTemplateTransformerListConstant],
};

export default es6Classes;
