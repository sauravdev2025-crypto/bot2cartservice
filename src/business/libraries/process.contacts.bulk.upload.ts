import { UploadService } from '@servicelabsco/nestjs-utility-services';
import { BulkUploadEntity, BulkUploadService, BusinessUserEntity, CustomFieldService } from '@servicelabsco/slabs-access-manager';
import { AddContactDto } from '../dtos/add.contact.dto';
import { BusinessEntity } from '../entities/business.entity';
import { ContactEntity } from '../entities/contact.entity';
import { ContactService } from '../services/contact.service';
import { CommonBulkUpload } from './common.bulk.upload';

export class ProcessContactsBulkUpload extends CommonBulkUpload {
  private sheetName = 'contacts';

  constructor(
    protected readonly uploadService: UploadService,
    protected readonly bulkUploadService: BulkUploadService,
    protected readonly customFieldService: CustomFieldService,
    protected readonly contactService: ContactService
  ) {
    super();
  }

  async process(upload: BulkUploadEntity) {
    this.upload = await BulkUploadEntity.first(upload.id);

    await this.setContacts();
    return this.loadStats();
  }

  private async setContacts() {
    // await this.loadParent(this.sheetName, ExpenseHeadEntity, 'parent');
    await this.loadContacts();
  }

  private async loadContacts() {
    const records = await this.getRecords(this.sheetName);
    const business = await BusinessEntity.first(this.upload.business_id);

    for (const record of records) {
      const { data } = record;
      try {
        const { uuid } = data;
        let recordData: ContactEntity;
        if (uuid) {
          recordData = await ContactEntity.findOne({
            where: {
              uuid,
            },
          });
        } else {
          recordData = await ContactEntity.findOne({
            where: {
              business_id: business.id,
              dialing_code: data?.dial_code,
              mobile: data?.mobile,
            },
          });
        }

        let bu: BusinessUserEntity;

        if (data?.manager_email) {
          bu = await BusinessUserEntity.findOne({ where: { business_id: business.id, user: { email: data?.manager_email } } });
        }

        const payload: AddContactDto = {
          custom_attributes: data?.custom_attributes,
          dialing_code: data?.dial_code,
          mobile: data?.mobile,
          name: data?.name,
          managed_by: bu?.id,
          id: recordData?.id,
        };

        recordData = await this.contactService.setContact(payload, business);
        if (recordData) record.attributes = { ...record.attributes, object_id: recordData.id, object_identifier: recordData.id };

        await record.save();
      } catch (error) {
        await this.setError(record, error);
      }
      record.processed_at = new Date();
    }
  }
}
