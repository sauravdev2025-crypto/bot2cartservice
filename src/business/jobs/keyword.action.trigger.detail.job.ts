import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { KeywordActionTriggerDetailEntity } from '../entities/keyword.action.trigger.detail.entity';

@Injectable()
export class KeywordActionTriggerDetailJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('cad0ff16bd2e5cba5eee71ccee96c685');
  }
  async handle(evt: DatabaseEventDto<KeywordActionTriggerDetailEntity>) {
    return evt.entity;
  }
}
