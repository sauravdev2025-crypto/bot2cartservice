import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { IdentifierSerialEntity } from '../entities/identifier.serial.entity';
import { IdentifierSerialJob } from '../jobs/identifier.serial.job';

@EventSubscriber()
export class IdentifierSerialSubscriber extends CommonSubscriber<IdentifierSerialEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: IdentifierSerialJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return IdentifierSerialEntity;
  }
}
