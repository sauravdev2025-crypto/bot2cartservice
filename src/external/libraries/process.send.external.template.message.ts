import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { FacebookSendTemplateMessageDto } from '../../business/dtos/facebook.send.template.message.dto';
import { BroadcastMessageEntity } from '../../business/entities/broadcast.message.entity';
import { BusinessEntity } from '../../business/entities/business.entity';
import { CommunicationWhatsappTemplateEntity } from '../../business/entities/communication.whatsapp.template.entity';
import { WhatsappTemplateStatusEnum } from '../../business/enums/whatsapp.template.status.enum';
import { CreateBroadcastMessagePayload } from '../../business/libraries/create.broadcast.message.payload';
import { TemplateUtil } from '../../common/template.util';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { SendExternalTemplateMessagePayloadDto } from '../dtos/send.external.template.message.payload.dto';
import { ExternalMessageService } from '../services/external.message.service';

export class ProcessSendExternalTemplateMessage {
  protected body: SendExternalTemplateMessagePayloadDto;

  protected payload: FacebookSendTemplateMessageDto;
  protected template: CommunicationWhatsappTemplateEntity;

  constructor(
    protected readonly business: BusinessEntity,
    protected readonly externalMessageService: ExternalMessageService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService
  ) {}

  public async send(body: SendExternalTemplateMessagePayloadDto, send_via_queue?: boolean) {
    this.body = body;

    if (this.body.wa_id) {
      const { dialing_code, mobile } = TemplateUtil.getDialingCodeFromMobile(this.body.wa_id);
      this.body.dialing_code = +dialing_code;
      this.body.mobile = +mobile;
    }

    await this.validate();
    await this.setPayload();

    const broadcast = await this.setBroadCastMessage();
    return this.sendMessage(broadcast, send_via_queue);
  }

  private async validate() {
    const template = await CommunicationWhatsappTemplateEntity.findOne({
      where: { identifier: this.body.template_identifier, business_id: this.business?.id },
    });
    if (template?.status_id !== WhatsappTemplateStatusEnum.APPROVED) throw new OperationException('template is not approved');

    this.template = template;
  }

  private async sendMessage(broadcast: BroadcastMessageEntity, send_via_queue: boolean) {
    const data = await this.externalMessageService.sendMessage(broadcast?.id, send_via_queue);
    return data?.response;
  }

  private async setPayload() {
    try {
      const payload = await new CreateBroadcastMessagePayload(this.businessMetaIntegrationService).create({
        id: this.template.id,
        dialing_code: String(this.body.dialing_code),
        mobile: String(this.body.mobile),
        variables: this.body.variables,
      });

      this.payload = payload;
    } catch (error) {
      throw new OperationException(error?.message);
    }
  }

  private setBroadCastMessage() {
    return this.externalMessageService.setBroadCastMessage(this.business.id, {
      dialing_code: this.body.dialing_code,
      mobile: String(this.body.mobile),
      template_id: this.template.id,
      payload: this.payload,
    });
  }
}
