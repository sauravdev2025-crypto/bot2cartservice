import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { EmailNotificationPayloadDto, SendEmailService } from '@servicelabsco/slabs-access-manager';
import { CommunicationUserEntity } from '../../utility/entities/communication.user.entity';
import { BusinessService } from '../../utility/services/business.service';
import { BusinessUserInvitationEntity } from '../entities/business.user.invitation.entity';

@Injectable()
export class BusinessUserInvitationJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly sendEmailService: SendEmailService,
    protected readonly businessService: BusinessService
  ) {
    super('20bb602509111f21ad8f06d3a03fb5b6');
  }
  async handle(evt: DatabaseEventDto<BusinessUserInvitationEntity>) {
    await this.sendInvitationEmail(evt);
    await this.resendInvitation(evt);
    return evt.entity;
  }

  async sendInvitationEmail(evt: DatabaseEventDto<BusinessUserInvitationEntity>) {
    if (!this.isColumnUpdated(evt, ['email'])) return;
    return this.sendInvitationMail(evt.entity);
  }

  async resendInvitation(evt: DatabaseEventDto<BusinessUserInvitationEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['attributes'])) return;

    const prevResend = evt.databaseEntity.attributes?.resend || 0;
    const newResend = evt.entity.attributes?.resend;

    if (newResend > prevResend) return this.sendInvitationMail(evt.entity);
  }

  async getUrl(email: string) {
    const baseUrl = this.businessService.getFrontendUrl();
    const user = await CommunicationUserEntity.findOne({ where: { email } });
    if (!user) return `${baseUrl}/signup?email=${email}`;
    return `${baseUrl}/login?email=${email}`;
  }

  // static function
  async sendInvitationMail(bui: BusinessUserInvitationEntity) {
    const entity = await BusinessUserInvitationEntity.first(bui.id, { relations: ['business'] });
    const link = await this.getUrl(entity.email);

    const payload: EmailNotificationPayloadDto = {
      data: { business_name: entity.business.name, link },
      to: bui.email,
      template: 'business-user-invitation',
      subject: `You’re Invited to ${entity.business.name} Dartinbox Account`,
    };

    await this.sendEmailService.sendEmail(payload);
  }
}
