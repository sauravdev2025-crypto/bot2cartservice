import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { KeywordActionDetailEntity } from '../entities/keyword.action.detail.entity';

@Injectable()
export class KeywordActionDetailJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('4b8a3e7a99cac4b1ce5fafa756f43e21');
  }
  async handle(evt: DatabaseEventDto<KeywordActionDetailEntity>) {
    return evt.entity;
  }
}
