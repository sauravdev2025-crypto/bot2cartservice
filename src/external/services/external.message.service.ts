import { Injectable } from '@nestjs/common';
import { SendTeamInboxSimpleMessagePayloadDto } from '../../business/dtos/send.team.inbox.message.payload.dto';
import { BroadcastMessageEntity } from '../../business/entities/broadcast.message.entity';
import { FacebookInternalMessageService } from '../../business/services/facebook.internal.message.service';
import { TeamInboxService } from '../../business/services/team.inbox.service';
import SourceHash from '../../config/source.hash';
import { ExternalListMessagePayloadDto } from '../dtos/send.external.template.message.payload.dto';

@Injectable()
export class ExternalMessageService {
  constructor(
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly teamInboxService: TeamInboxService
  ) {}

  public async setBroadCastMessage(
    business_id: number,
    { mobile, dialing_code, template_id, payload }: { mobile: string; dialing_code: number; template_id?: number; payload: any }
  ) {
    const broadcast = BroadcastMessageEntity.create({});

    broadcast.source_type = SourceHash.ExternalSource;
    broadcast.business_id = business_id;

    broadcast.mobile = mobile;
    broadcast.dialing_code = dialing_code;

    broadcast.from_external_source = true;

    broadcast.template_id = template_id;
    broadcast.payload = payload;

    return broadcast.save();
  }

  public async sendMessage(broadcast_id: number, send_via_queue: boolean = false) {
    if (send_via_queue) {
      const broadcast = await BroadcastMessageEntity.first(broadcast_id);
      await this.facebookInternalMessageService.sendQueueBroadcastMessage(broadcast);

      return {
        response: {
          status: 'QUEUE_MESSAGE_INITIATED',
          dart_message_id: broadcast?.uuid,
        },
      };
    }
    return this.facebookInternalMessageService.sendBroadcastMessage(broadcast_id);
  }

  public getNormalMessagePayload(dialing_code: number, mobile: number, payload: SendTeamInboxSimpleMessagePayloadDto) {
    return {
      to: `${dialing_code}${mobile}`,
      ...this.teamInboxService.getNormalMessageCommonPayload(payload),
    };
  }

  async getListMessagePayload(data: ExternalListMessagePayloadDto) {
    const { mobile, dialing_code, payload: payloadDto } = data;

    const { html, sections, header, footer, buttonName } = payloadDto;

    const body = html; // You may want to process variables here if needed

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: `${dialing_code}${mobile}`,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: body,
        },
        action: {
          sections: sections?.map((sec) => ({
            title: sec.title,
            rows: sec?.rows?.map((ro) => ({
              id: ro.id,
              description: ro.description,
              title: ro.text,
            })),
          })),
          button: buttonName,
        },
      },
    };

    if (header) {
      payload.interactive.header = {
        type: 'text',
        text: header,
      };
    }

    if (footer) {
      payload.interactive.footer = {
        text: footer,
      };
    }
    return payload;
  }
}
