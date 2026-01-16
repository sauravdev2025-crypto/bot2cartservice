import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { IdentifierSerialEntity } from '../entities/identifier.serial.entity';

@Injectable()
export class IdentifierSerialJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('05e2da3bcd1009d250e3ee225513b8de');
  }
  async handle(evt: DatabaseEventDto<IdentifierSerialEntity>) {
    return evt.entity;
  }
}
