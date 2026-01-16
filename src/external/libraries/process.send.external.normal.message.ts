import { SendTeamInboxSimpleMessagePayloadDto } from '../../business/dtos/send.team.inbox.message.payload.dto';
import { BroadcastMessageEntity } from '../../business/entities/broadcast.message.entity';
import { BusinessEntity } from '../../business/entities/business.entity';
import { TemplateUtil } from '../../common/template.util';
import { SendExternalNormalMessagePayload } from '../dtos/send.external.template.message.payload.dto';
import { ExternalMessageService } from '../services/external.message.service';

export class ProcessSendExternalNormalMessage {
  protected body: SendExternalNormalMessagePayload;
  protected payload: any;

  constructor(
    protected readonly business: BusinessEntity,
    protected readonly externalMessageService: ExternalMessageService
  ) {}

  public async send(body: SendExternalNormalMessagePayload, send_via_queue?: boolean) {
    this.body = body;

    if (this.body.wa_id) {
      const { dialing_code, mobile } = TemplateUtil.getDialingCodeFromMobile(this.body.wa_id);
      this.body.dialing_code = +dialing_code;
      this.body.mobile = +mobile;
    }

    await this.setPayload();
    const broadcast = await this.setBroadCastMessage();

    return this.sendMessage(broadcast, send_via_queue);
  }

  private async sendMessage(broadcast: BroadcastMessageEntity, send_via_queue?: boolean) {
    const data = await this.externalMessageService.sendMessage(broadcast?.id, send_via_queue);
    return data?.response;
  }

  private async setPayload() {
    const data: SendTeamInboxSimpleMessagePayloadDto = {
      attachment: this.body?.attachment,
      data: this.body?.data,
      sticker: this.body?.sticker,
    };

    this.payload = this.externalMessageService.getNormalMessagePayload(this.body.dialing_code, this.body.mobile, data);
  }

  private setBroadCastMessage() {
    return this.externalMessageService.setBroadCastMessage(this.business.id, {
      dialing_code: this.body.dialing_code,
      mobile: String(this.body.mobile),
      payload: this.payload,
    });
  }
}
