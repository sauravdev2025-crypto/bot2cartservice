import { OperationException } from '@servicelabsco/nestjs-utility-services';
import SourceHash from '../../config/source.hash';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { FacebookSendTemplateMessageDto } from '../dtos/facebook.send.template.message.dto';
import { SendTeamInboxMessagePayloadDto } from '../dtos/send.team.inbox.message.payload.dto';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { BusinessEntity } from '../entities/business.entity';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { WhatsappTemplateStatusEnum } from '../enums/whatsapp.template.status.enum';
import { FacebookInternalMessageService } from '../services/facebook.internal.message.service';
import { CreateBroadcastMessagePayload } from './create.broadcast.message.payload';

export class ProcessSendTeamInboxMessage {
  protected body: SendTeamInboxMessagePayloadDto;

  protected payload: FacebookSendTemplateMessageDto;

  protected contact: ContactEntity;
  protected teamInbox: TeamInboxEntity;

  constructor(
    protected readonly business: BusinessEntity,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService
  ) {}

  public async send(body: SendTeamInboxMessagePayloadDto) {
    this.body = body;

    await this.validate();
    await this.setTeamInbox();

    await this.setPayload();

    const message = await this.setBroadCastMessage();
    await this.facebookInternalMessageService.sendViaHttps(message?.id);

    return this.teamInbox;
  }

  private async validate() {
    const template = await CommunicationWhatsappTemplateEntity.first(this.body.template_id);
    if (template?.status_id !== WhatsappTemplateStatusEnum.APPROVED) throw new OperationException('template is not approved');

    const contact = await ContactEntity.first(this.body.contact_id);
    if (!contact?.active) throw new OperationException('Invalid Contact');

    this.contact = contact;
  }

  private async setTeamInbox() {
    const teamInbox = await TeamInboxEntity.firstOrCreate({ business_id: this.business.id, contact_id: this.contact.id });
    if (teamInbox?.id) return (this.teamInbox = teamInbox);

    teamInbox.active = true;
    teamInbox.only_broadcast = false;

    this.teamInbox = await teamInbox.save();
  }

  private async setPayload() {
    try {
      const payload = await new CreateBroadcastMessagePayload(this.businessMetaIntegrationService).create({
        id: this.body.template_id,
        dialing_code: String(this.contact.dialing_code),
        mobile: this.contact.mobile,
        variables: Object.entries(this.body.custom_attributes).map(([key, value]) => {
          return { key, value };
        }),
      });

      this.payload = payload;
    } catch (error) {
      throw new OperationException(error?.message);
    }
  }

  private setBroadCastMessage() {
    const broadcast = BroadcastMessageEntity.create({});

    broadcast.source_type = SourceHash.TeamInbox;
    broadcast.source_id = this.teamInbox.id;

    broadcast.business_id = this.business.id;
    broadcast.mobile = this.contact.mobile;
    broadcast.dialing_code = this.contact.dialing_code;

    broadcast.template_id = this.body.template_id;
    broadcast.is_replied = false;
    broadcast.payload = this.payload;

    return broadcast.save();
  }
}
