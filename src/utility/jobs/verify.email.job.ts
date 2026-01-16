import { Injectable } from '@nestjs/common';
import { CommonJob, MailValidationEntity, QueueService, UserEntity } from '@servicelabsco/nestjs-utility-services';
import { EmailNotificationPayloadDto, SendEmailService } from '@servicelabsco/slabs-access-manager';

@Injectable()
export class VerifyEmailJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    private readonly sendEmailService: SendEmailService
  ) {
    super('8baab390aa21eae8e9d738fc4f4ab257');
  }
  async handle(validation: MailValidationEntity) {
    const user = await UserEntity.findOne({ where: { email: validation?.email } });

    const emailPayload: EmailNotificationPayloadDto = {
      data: { code: validation.code, name: user?.name },
      to: validation?.email,
      template: 'verify-email',
      subject: 'Verify Your Email!!',
    };

    await this.sendEmailService.sendEmail(emailPayload);
  }
}
