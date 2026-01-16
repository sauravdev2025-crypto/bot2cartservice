import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { FacebookInternalLogEntity } from '../entities/facebook.internal.log.entity';

@Injectable()
export class FacebookInternalLogJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('564ac153cf5b1210dfce68d038a90173');
  }
  async handle(evt: DatabaseEventDto<FacebookInternalLogEntity>) {
    return evt.entity;
  }
}
