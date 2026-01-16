import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import SourceHash from '../../config/source.hash';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { FacebookSendTemplateMessageDto } from '../dtos/facebook.send.template.message.dto';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { ScheduleBroadcastEntity } from '../entities/schedule.broadcast.entity';
import { ProcessScheduledCsvData } from '../libraries/process.scheduled.csv.data';

@Injectable()
export class SetScheduleBroadcastJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService
  ) {
    super('4d53ddc66bc5af9bf3585366482a1704');
  }
  async handle(schedule_broadcast_id: number) {
    const schedule = await ScheduleBroadcastEntity.first(schedule_broadcast_id);
    if (schedule?.initiated_at) return;

    const payloads = await new ProcessScheduledCsvData(this.businessMetaIntegrationService).process(schedule?.csv, schedule?.template_id);
    if (!payloads?.length) return;

    for await (const payload of payloads) {
      await this.setScheduleMessage(payload?.data, { dialing_code: +payload?.dialing_code, mobile: payload?.mobile }, schedule);
    }

    schedule.attributes = { ...(schedule?.attributes || {}), total: payloads?.length };
    return schedule.save();
  }

  async setScheduleMessage(
    payload: FacebookSendTemplateMessageDto,
    { dialing_code, mobile }: { dialing_code: number; mobile: string },
    schedule: ScheduleBroadcastEntity
  ) {
    const message = BroadcastMessageEntity.create();

    message.business_id = schedule.business_id;
    message.source_type = SourceHash.ScheduleBroadcast;
    message.source_id = schedule.id;
    message.template_id = schedule.template_id;
    message.scheduled_at = schedule.scheduled_at;
    message.is_replied = false;
    message.active = true;
    message.dialing_code = dialing_code;
    message.mobile = mobile;
    message.payload = payload;

    return message.save();
  }
}
