import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService, UserEntity } from '@servicelabsco/nestjs-utility-services';
import SourceHash from '../../config/source.hash';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { ScheduleBroadcastEntity } from '../entities/schedule.broadcast.entity';
import { FacebookInternalMessageService } from '../services/facebook.internal.message.service';
import { SetScheduleBroadcastJob } from './set.schedule.broadcast.job';

@Injectable()
export class ScheduleBroadcastJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService,
    protected readonly setScheduleBroadcastJob: SetScheduleBroadcastJob,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService
  ) {
    super('870b9327b5e851cc3706808dc89d485f');
  }
  async handle(evt: DatabaseEventDto<ScheduleBroadcastEntity>) {
    await this.processCsvFile(evt);
    await this.handleDelete(evt);

    await this.sendWhatsappBroadcastCompletedMessage(evt);

    return evt.entity;
  }

  async processCsvFile(evt: DatabaseEventDto<ScheduleBroadcastEntity>) {
    if (!this.isNewRecord(evt)) return;
    if (!evt.entity.csv) return;

    return this.setScheduleBroadcastJob.dispatch(evt.entity.id);
  }

  async handleDelete(evt: DatabaseEventDto<ScheduleBroadcastEntity>) {
    if (this.isNewRecord(evt)) return;

    if (!this.isColumnUpdated(evt, ['deleted_at'])) return;
    if (!evt.entity.deleted_at) return;

    const messages = await BroadcastMessageEntity.find({
      where: { business_id: evt.entity.business_id, source_id: evt.entity.id, source_type: SourceHash.ScheduleBroadcast },
    });

    for await (const message of messages) {
      const data = await BroadcastMessageEntity.first(message.id);
      await data.softDelete();
    }
  }

  async sendWhatsappBroadcastCompletedMessage(evt: DatabaseEventDto<ScheduleBroadcastEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['completed_at'])) return;

    if (!evt.entity.completed_at) return;

    const stats = evt.entity.attributes;
    const user = await UserEntity.first(evt.entity?.updated_by || evt.entity?.created_by);
    if (!user.dialing_code || !user.mobile) return;

    const fndLink = `https://app.dartinbox.com/schedule-broadcast/${evt.entity.id}`;

    const message = `📢 *Scheduled Broadcast Successfully Completed*

*Broadcast Details:*
• Name: ${evt.entity.name}
• Total Messages: ${stats?.total}
• Status: ✅ Completed

*Next Steps:*
For detailed analytics and performance metrics, please access your broadcast dashboard at: ${fndLink}

Thank you for using Dart Inbox for your communication needs.`;

    await this.facebookInternalMessageService.sendTemplateMessage(
      { source_type: 'internal-broadcast-message', source_id: evt.entity.id },
      {
        to: `${user?.dialing_code}${user?.mobile}`,
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        type: 'text',
        text: {
          body: message,
        },
      },
      evt.entity.business_id
    );
  }
}
