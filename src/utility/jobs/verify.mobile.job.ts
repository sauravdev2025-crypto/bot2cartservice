import { Injectable } from '@nestjs/common';
import { CommonJob, PropertyService, QueueService, RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import { FacebookInternalMessageService } from '../../business/services/facebook.internal.message.service';
import { MobileValidationService } from '../services/mobile.validation.service';

@Injectable()
export class VerifyMobileJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly mobileValidationService: MobileValidationService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly remoteRequestService: RemoteRequestService,
    protected readonly propertyService: PropertyService
  ) {
    super('e027f7aa6f004414f549cdd0bbd46ac6');
  }

  async handle({ mobile, dialing_code, otp }: { mobile: number; dialing_code: number; otp: number }) {
    const internal = await this.propertyService.get('inside.business.id');
    if (!internal) return;

    const business_id = +internal;

    await this.facebookInternalMessageService.sendTemplateMessage(
      { source_type: 'internal-check', source_id: 1 },
      {
        to: `${dialing_code}${mobile}`,
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        type: 'template',
        template: {
          name: 'mobile_verification',
          language: {
            code: 'en',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: `${otp}`,
                },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                {
                  type: 'text',
                  text: `${otp}`,
                },
              ],
            },
          ],
        },
      },
      business_id
    );
  }
}
