import { Injectable } from '@nestjs/common';
import { QueueService, UploadService } from '@servicelabsco/nestjs-utility-services';
import { BulkUploadEntity, BulkUploadService, CustomFieldService } from '@servicelabsco/slabs-access-manager';
import { ProcessCommonFileJob } from '../../utility/jobs/process.common.file.job';
import { BulkUploadTypeEnum } from '../enums/bulk.upload.type.enum';
import { ProcessContactsBulkUpload } from '../libraries/process.contacts.bulk.upload';
import { ContactService } from '../services/contact.service';

@Injectable()
export class ProcessBulkUploadJob extends ProcessCommonFileJob {
  protected timeout: number = 6000000;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly uploadService: UploadService,
    protected readonly bulkUploadService: BulkUploadService,
    protected readonly customFieldService: CustomFieldService,
    protected readonly contactService: ContactService
  ) {
    super('2138b885ef3ab43742d8661c2077a362');
  }
  async handle(id: number) {
    const upload = await BulkUploadEntity.first(id, { relations: ['definition.script'] });

    if (upload.definition_id === BulkUploadTypeEnum.CONTACT)
      return new ProcessContactsBulkUpload(this.uploadService, this.bulkUploadService, this.customFieldService, this.contactService).process(upload);

    return null;
  }

  private async getSheetName(definitionId: number) {
    switch (definitionId) {
      case BulkUploadTypeEnum.CONTACT:
        return 'contacts';

      default:
        return null;
    }
  }
}
