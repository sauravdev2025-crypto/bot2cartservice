import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ExternalApiLogEntity } from '../entities/external.api.log.entity';

@Injectable()
export class ExternalApiLogJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('a9c703c7d4477744153584f784512b8b');
  }
  async handle(evt: DatabaseEventDto<ExternalApiLogEntity>) {
    return evt.entity;
  }
}
