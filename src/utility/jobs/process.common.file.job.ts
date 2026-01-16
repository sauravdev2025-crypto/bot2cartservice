import { CommonJob } from '@servicelabsco/nestjs-utility-services';
import { BulkUploadItemEntity } from '@servicelabsco/slabs-access-manager';
import { IsNull, MoreThan } from 'typeorm';

export class ProcessCommonFileJob extends CommonJob {
  protected fn: any;

  protected async getItems(id: number, min: number) {
    return BulkUploadItemEntity.find({
      where: { bulk_upload_id: id, row_num: MoreThan(min), processed_at: IsNull() },
      order: { row_num: 'asc' },
      take: 500,
    });
  }

  protected async getItemSheets(id: number, min: number, sheet: string) {
    return BulkUploadItemEntity.find({
      where: { bulk_upload_id: id, row_num: MoreThan(min), sheet, processed_at: IsNull() },
      order: { row_num: 'asc' },
      take: 500,
    });
  }
}
