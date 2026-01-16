import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { FileUploadService } from '@servicelabsco/slabs-access-manager';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { WhatsappTemplateStatusEnum } from '../enums/whatsapp.template.status.enum';
import { CreateWhatsappBroadcastTemplateCsv } from '../libraries/create.whatsapp.broadcast.template.csv';
import { FacebookInternalTemplateService } from '../services/facebook.internal.template.service';

@Injectable()
export class CommunicationWhatsappTemplateJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly facebookInternalTemplateService: FacebookInternalTemplateService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService,
    protected readonly fileUploadService: FileUploadService
  ) {
    super('48222a5aa6d6be750c48c318b2aee638');
  }
  async handle(evt: DatabaseEventDto<CommunicationWhatsappTemplateEntity>) {
    await this.handleApprovedState(evt);
    return evt.entity;
  }

  async handleApprovedState(evt: DatabaseEventDto<CommunicationWhatsappTemplateEntity>) {
    if (!this.isColumnUpdated(evt, ['status_id'])) return;
    if (evt.entity.status_id !== WhatsappTemplateStatusEnum.APPROVED) return;

    const entity = await CommunicationWhatsappTemplateEntity.first(evt.entity.id);
    const link = await new CreateWhatsappBroadcastTemplateCsv(this.fileUploadService).getLink(entity.id);

    entity.csv_url = link;

    return entity.save();
  }
}
