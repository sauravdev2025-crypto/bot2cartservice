import { Injectable } from '@nestjs/common';
import { AuthService, CommonJob, QueueService, UserEntity } from '@servicelabsco/nestjs-utility-services';
import { EmailNotificationPayloadDto, SendEmailService } from '@servicelabsco/slabs-access-manager';
import { CommunicationUserEntity } from '../entities/communication.user.entity';
import { BusinessService } from '../services/business.service';

@Injectable()
export class SendForgetPasswordEmailJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    private readonly sendEmailService: SendEmailService,
    private readonly authService: AuthService,
    private readonly businessService: BusinessService
  ) {
    super('469ab43c20f0fa5574b5364802806e52');
  }
  async handle(comUser: CommunicationUserEntity) {
    const user = await UserEntity.findOne({ where: { email: comUser?.email } });
    const token = await this.authService.signJwtToken({ user_id: user?.id });

    const baseUrl = this.businessService.getFrontendUrl();

    const emailPayload: EmailNotificationPayloadDto = {
      data: { user_name: user.name, link: `${baseUrl}/reset-password?email=${user.email}&token=${token}` },
      to: user?.email,
      template: 'forget-password',
      subject: 'Reset your Password!!',
    };

    await this.sendEmailService.sendEmail(emailPayload);
  }
}
