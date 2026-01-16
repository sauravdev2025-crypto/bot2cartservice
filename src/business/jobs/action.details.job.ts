import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ActionDetailsEntity } from '../entities/action.details.entity';

@Injectable()
export class ActionDetailsJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('605b962f33977ea444d75ec1a98c2a5f');
  }
  async handle(evt: DatabaseEventDto<ActionDetailsEntity>) {
    return evt.entity;
  }
}
