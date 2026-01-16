import { Injectable } from '@nestjs/common';
import { CommonJob, LookupValueEntity, QueueService } from '@servicelabsco/nestjs-utility-services';
import { WebhookService } from '@servicelabsco/slabs-access-manager';
import { ILike } from 'typeorm';
import { WebhookEventsConstants } from '../../config/webhook.event.constants';
import { ChangeValue, FacebookWebhookEventDto } from '../dtos/facebook.webhook.event.dto';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { WhatsappTemplateStatusEnum } from '../enums/whatsapp.template.status.enum';
import { FacebookInternalService } from '../services/facebook.internal.service';

@Injectable()
export class HandleFacebookApprovalJob extends CommonJob {
  protected priority = 5;
  private payload: FacebookWebhookEventDto;
  constructor(
    protected readonly queueService: QueueService,
    protected readonly facebookInternalService: FacebookInternalService,
    protected readonly webhookService: WebhookService
  ) {
    super('f225ab09415efacc869342b9f3557431');
  }

  async handle(rawData: FacebookWebhookEventDto) {
    this.payload = rawData;
    for (const _data of rawData.entry) {
      for (const change of _data?.changes || []) {
        await this.route(change);
      }
    }
  }

  private async route(change: any) {
    const value = change?.value as ChangeValue;
    const message_id = String(value.message_template_id);

    const template = await CommunicationWhatsappTemplateEntity.findOne({ where: { message_id } });
    if (!template) return;

    if (change?.field === 'template_category_update') {
      const getCategory = await LookupValueEntity.findOne({
        where: { lookup_type_id: 201, name: ILike(change?.value?.new_category?.toLowerCase()) },
      });

      template.category_id = getCategory?.id;
    }

    template.webhook_response = { ...template?.webhook_response, ...this.payload };

    if (value.event === 'APPROVED') template.status_id = WhatsappTemplateStatusEnum.APPROVED;
    if (value.event === 'REJECTED') template.status_id = WhatsappTemplateStatusEnum.REJECTED;

    await template.save();
    // await this.webhookService.triggerEvent(template.business_id, { event_identifier: WebhookEventsConstants.TEMPLATE_UPDATE, payload: change });
  }
}
