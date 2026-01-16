import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { LocalBulkUploadJob } from '../jobs/local.bulk.upload.job';
import { BulkUploadEntity } from '@servicelabsco/slabs-access-manager';

@EventSubscriber()
export class BulkUploadSubscriber extends CommonSubscriber<BulkUploadEntity> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly localBulkUploadJob: LocalBulkUploadJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return BulkUploadEntity;
  }

  async afterInsert(event: InsertEvent<BulkUploadEntity>) {
    await this.localBulkUploadJob.delayedDispatch(this.getEventData(event));
  }

  async afterUpdate(event: UpdateEvent<BulkUploadEntity>) {
    await this.localBulkUploadJob.delayedDispatch(this.getEventData(event));
  }
}
