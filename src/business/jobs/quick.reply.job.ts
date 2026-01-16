import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { QuickReplyEntity } from '../entities/quick.reply.entity';

@Injectable()
export class QuickReplyJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('828fc0ccae03b9f3be1beb610123fd29');
  }
  async handle(evt: DatabaseEventDto<QuickReplyEntity>) {
    return evt.entity;
  }
}
