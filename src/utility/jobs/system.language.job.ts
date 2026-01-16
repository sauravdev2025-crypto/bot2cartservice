import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { SystemLanguageEntity } from '../entities/system.language.entity';

@Injectable()
export class SystemLanguageJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('888b8d1daf01bb5f715d8a1d4dbc8873');
  }
  async handle(evt: DatabaseEventDto<SystemLanguageEntity>) {
    return evt.entity;
  }
}
