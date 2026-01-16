import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { CommunicationUserEntity } from '../entities/communication.user.entity';

@Injectable()
export class CommunicationUserJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('aa10e73a0286a0b10d85141168642502');
  }
  async handle(evt: DatabaseEventDto<CommunicationUserEntity>) {
    return evt.entity;
  }
}
