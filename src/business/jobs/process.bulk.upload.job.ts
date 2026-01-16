import { Injectable } from '@nestjs/common';
import { QueueService, UploadService } from '@servicelabsco/nestjs-utility-services';
import { BulkUploadEntity, BulkUploadService, CustomFieldService } from '@servicelabsco/slabs-access-manager';
import { ProcessCommonFileJob } from '../../utility/jobs/process.common.file.job';
import { BulkUploadTypeEnum } from '../enums/bulk.upload.type.enum';

@Injectable()
export class ProcessBulkUploadJob extends ProcessCommonFileJob {
  protected timeout: number = 6000000;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly uploadService: UploadService,
    protected readonly bulkUploadService: BulkUploadService,
    protected readonly customFieldService: CustomFieldService
  ) {
    super('2138b885ef3ab43742d8661c2077a362');
  }
  async handle(id: number) {}
}
