import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService, UploadService } from '@servicelabsco/nestjs-utility-services';
import { BulkUploadEntity, BulkUploadService, SetBulkUploadLogFile } from '@servicelabsco/slabs-access-manager';
import { ProcessBulkUploadJob } from './process.bulk.upload.job';

@Injectable()
export class LocalBulkUploadJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    private readonly uploadService: UploadService,
    private readonly bulkUploadService: BulkUploadService,
    private readonly processBulkUploadJob: ProcessBulkUploadJob
  ) {
    super('ce20d57ab8a4f605e5000a6225b0bf32');
  }
  async handle(evt: DatabaseEventDto<BulkUploadEntity>) {
    await this.processFile(evt);
    await this.logFile(evt);
  }

  private async processFile(evt: DatabaseEventDto<BulkUploadEntity>) {
    if (!this.isColumnUpdated(evt, ['analysed_at'])) return;
    if (!evt.entity.analysed_at) return;

    return this.processBulkUploadJob.dispatch(evt.entity.id);
  }

  private async logFile(evt: DatabaseEventDto<BulkUploadEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['processed_at'])) return;
    if (!evt.entity.processed_at) return;
    if (evt.entity.source_type) return;

    const upload = await BulkUploadEntity.first(evt.entity.id);

    await new SetBulkUploadLogFile(this.uploadService, this.bulkUploadService).process(upload);
  }
}
