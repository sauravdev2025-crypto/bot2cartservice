import { OperationException, RemoteRawResponseDto } from '@servicelabsco/nestjs-utility-services';
import { ProcessCommonData } from '@servicelabsco/slabs-access-manager';
import SourceHash from '../../config/source.hash';
import { WhatsappTemplateDto } from '../dtos/whatsapp.template.dto';
import { BusinessEntity } from '../entities/business.entity';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { WhatsappTemplateStatusEnum } from '../enums/whatsapp.template.status.enum';
import { FacebookInternalService } from '../services/facebook.internal.service';
import { TemplateCreationDuplicateVariableProcessor } from './template.creation.duplicate.variable.processor';

export class ProcessCommunicationTemplate extends ProcessCommonData {
  private body: WhatsappTemplateDto;

  constructor(
    private readonly business: BusinessEntity,
    private readonly facebookInternalService: FacebookInternalService
  ) {
    super();
  }

  public async create(body: WhatsappTemplateDto) {
    this.body = body;

    await this.validation();

    const sendForApproval = await this.sendForApproval();
    if (!sendForApproval?.status) return this.throwTemplateCreationError(sendForApproval);

    return this.saveTemplate(sendForApproval);
  }

  private async saveTemplate(response: RemoteRawResponseDto['data']) {
    let template = CommunicationWhatsappTemplateEntity.create({ business_id: this.business.id });
    if (this.body.id) template = await CommunicationWhatsappTemplateEntity.first(this.body.id);

    template.name = this.body.name;
    template.identifier = this.body.name;

    template.category_id = this.body.category_id;
    template.language_id = this.body.language_id;
    template.template_config = this.body.raw_json;

    template.message_id = response.id;
    template.attributes = {
      ...(template?.attributes || {}),
      initial_response: response,
      header_media_detail: this?.body?.header_media_detail,
      active_step: this.body?.active_step,
    };

    if (response?.status === 'APPROVED') template.status_id = WhatsappTemplateStatusEnum.APPROVED;
    if (response?.status === 'REJECTED') template.status_id = WhatsappTemplateStatusEnum.REJECTED;
    if (response?.status === 'PENDING') template.status_id = WhatsappTemplateStatusEnum.PENDING;

    return template.save();
  }

  private async throwTemplateCreationError(response: any) {
    const error = response?.error;

    if (!error) throw new OperationException('An unidentified error occur');

    throw new OperationException(error?.error_user_msg || error?.message);
  }

  private async sendForApproval() {
    const duplicateVariableProcessor = await new TemplateCreationDuplicateVariableProcessor().process(this.body.raw_json);
    return this.facebookInternalService.POST(duplicateVariableProcessor, {
      configs: 'template',
      source: { source_id: undefined, source_type: SourceHash.CommunicationWhatsappTemplate },
      business_id: this.business.id,
    });
  }

  /**
   *
   * All the validation will go below this
   */
  private async validation() {
    await this.validateName();

    this.throwExceptionOnError();
  }

  private async validateName() {
    const existSameName = await CommunicationWhatsappTemplateEntity.findOne({ where: { business_id: this.business.id, name: this.body.name } });
    if (existSameName?.name?.toUpperCase() === this.body?.name?.toUpperCase()) this.setColumnError('name', 'Duplicate Template Name');
  }
}
