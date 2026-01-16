import { UploadService } from '@servicelabsco/nestjs-utility-services';
import {
  BulkUploadEntity,
  BulkUploadService,
  CustomFieldEntity,
  ChoiceTypeEntity,
  ChoiceListEntity,
  BulkUploadItemEntity,
} from '@servicelabsco/slabs-access-manager';
import { isValid } from 'date-fns';
import { parse } from 'path';
import { ILike, Not, IsNull } from 'typeorm';
import { CommunicationUserEntity } from '../../utility/entities/communication.user.entity';
import { CommunicationBusinessUserEntity } from '../entities/communication.business.user.entity';

/**
 * Common functionality for handling bulk uploads
 */
export class CommonBulkUpload {
  protected upload: BulkUploadEntity;
  protected uploadService: UploadService;
  protected bulkUploadService: BulkUploadService;

  protected errorsCount: number;

  /**
   * Sets primary record for each item in the specified sheet
   * @param sheet - Name of the sheet to process
   * @param entity - Entity class to create/update records
   * @param primaryColumn - Primary column identifier
   * @param columns - Additional columns to update
   */
  protected async setPrimaryRecord(sheet: string, entity: any, primaryColumn: string, columns: string[] = []) {
    const records = await this.getRecords(sheet);

    for (const record of records) {
      const r = await this.setRecord(record, entity, primaryColumn, columns);
      if (r) record.attributes = { ...record.attributes, object_id: r.id, object_identifier: r[primaryColumn] };

      record.processed_at = new Date();
      await record.save();
    }
  }

  /**
   * Loads and sets parent relationships for records in the specified sheet
   * @param sheet - Name of the sheet to process
   * @param entity - Entity class to update
   * @param column - Column name containing parent reference
   * @param refColumn - Reference column name (defaults to 'name')
   */
  protected async loadParent(sheet: string, entity: any, column: string, refColumn = 'name') {
    const records = await this.getRecords(sheet, true);

    for (const record of records) {
      await this.setParent(record, entity, column, refColumn);
    }
  }
  /**
   * Sets custom field data for a collection of records
   * @param params - Object containing records, customFieldId, and businessId
   * @returns Array of records with updated custom field data
   */
  protected async setCustomFieldData({ records, customFieldId, businessId }: { records: any[]; customFieldId: number; businessId: number }) {
    const types = await this.getCustomFieldColumns({ typeId: customFieldId, businessId });
    return records.map((record) => {
      const customFieldData = types.reduce((acc, el: CustomFieldEntity) => {
        if (!record?.data?.[el?.identifier]) return acc;
        acc[el?.identifier] = record?.data?.[el?.identifier];
        return acc;
      }, {});
      record.data.custom_field_data = customFieldData;

      return record;
    });
  }

  /**
   * Retrieves custom field columns for a specific type and business
   * @param params - Object containing typeId and businessId
   * @returns Promise resolving to array of CustomFieldEntity
   */
  protected async getCustomFieldColumns({ typeId, businessId }: { typeId: number; businessId: number }) {
    return CustomFieldEntity.find({
      where: { business_id: businessId, type_id: typeId, active: true },
      order: { priority: 'ASC' },
    });
  }

  /**
   * Loads and sets manager relationships for records in the specified sheet
   * @param sheet - Name of the sheet to process
   * @param entity - Entity class to update
   * @param column - Column name containing manager reference
   * @param isEmployee - Whether the manager is an employee (defaults to true)
   */
  protected async loadManager(sheet: string, entity: any, column: string, isEmployee = true) {
    const records = await this.getRecords(sheet, true);

    for (const record of records) {
      await this.setManager(record, entity, column, isEmployee);
    }
  }

  /**
   * Updates record with specified column values
   * @private
   */
  private async setRecord(item: BulkUploadItemEntity, entity: any, primaryColumn: string, columns: string[] = []) {
    const r = await this.checkForDuplicate(entity, item, primaryColumn);
    if (!r) return;

    columns.forEach((column) => {
      r[column] = item.data[column];
    });

    return r.save();
  }

  /**
   * Sets parent relationship for a single record
   * @private
   */
  private async setParent(item: BulkUploadItemEntity, entity: any, column: string, refColumn: string) {
    const data = item.data;
    if (!item?.attributes?.object_id) return;

    const r = await entity.findOne({ where: { business_id: this.upload.business_id, id: item.attributes.object_id } });

    if (!r) return;

    const parentValue = data[column];

    if (parentValue) {
      const parent = await this.getRecordId(entity, refColumn, parentValue);

      if (!parent) return this.setColumnError(item, 'parent', 'this is not valid parent name');

      if (parent.id === r.id) return this.setColumnError(item, 'parent', 'Parent cannot be same as the child');

      r.parent_id = parent.id;
    } else {
      r.parent_id = null;
    }

    return r.save();
  }

  /**
   * Sets manager relationship for a single record
   * @private
   */
  private async setManager(item: BulkUploadItemEntity, entity: any, column: string, isEmployee = true) {
    const data = item.data;
    if (!item?.attributes?.object_id) return;

    const r = await entity.findOne({ where: { business_id: this.upload.business_id, id: item.attributes.object_id } });

    if (!r) return;

    const parentValue = data[column];

    if (parentValue) {
      let parent;

      if (isEmployee) parent = await this.getManagerId(parentValue);
      else parent = await this.getUserId(parentValue);

      if (!parent) return this.setColumnError(item, 'manager', 'this is not valid manager name');

      r.manager_id = parent.id;
    } else {
      r.manager_id = null;
    }

    return r.save();
  }

  /**
   * Retrieves user by email
   * @param email - Email address to look up
   * @returns Promise resolving to FinnotoUserEntity or undefined
   */
  protected getUserId(email: string) {
    if (!email) return;
    email = this.sanitizeEmail(email);

    return CommunicationUserEntity.findOne({ where: { email: email.toLowerCase() } });
  }

  /**
   * Retrieves record by column value
   * @private
   */
  private getRecordId(entity: any, column: string, value: string) {
    const where: any = { business_id: this.upload.business_id };
    where[column] = ILike(value);

    return entity.findOne({ where });
  }

  /**
   * Retrieves entity by UUID
   * @param entity - Entity class to query
   * @param uuid - UUID to look up
   */
  protected getEntity(entity: any, uuid: string) {
    return entity.findOne({ where: { business_id: this.upload.business_id, uuid } });
  }

  /**
   * Sets error message for an upload item
   * @param item - Bulk upload item to update
   * @param error - Error message
   */
  protected async setError(item: BulkUploadItemEntity, error: string) {
    if (!item.error) item.error = {};
    item.error.error = error;

    item.errors_count = item.errors_count || 0;
    item.errors_count += 1;

    await item.save();
  }

  /**
   * Sets column-specific error for an upload item
   * @param item - Bulk upload item to update
   * @param column - Column name with error
   * @param error - Error message
   */
  protected async setColumnError(item: BulkUploadItemEntity, column: string, error: string) {
    if (!item.error) item.error = {};
    if (!item.error?.columns) item.error = { ...item.error, columns: {} };

    item.error.columns[column] = error;

    item.errors_count = item.errors_count || 0;
    item.errors_count += 1;

    await item.save();
  }

  /**
   * Checks for duplicate records and handles creation/update
   * @private
   */
  private async checkForDuplicate(entity: any, item: BulkUploadItemEntity, column: string) {
    const value = item.data[column];

    const where: any = { business_id: this.upload.business_id };
    where[column] = value;

    const record = await entity.findOne({ where });

    const uuid = item.data.uuid;
    if (!uuid) {
      if (record?.id) return this.setColumnError(item, column, 'this is a duplicate item');

      return entity.create(where);
    }

    const r = await entity.findOne({ where: { business_id: this.upload.business_id, uuid } });

    if (!r) return this.setColumnError(item, 'uuid', 'this record does not exist');
    if (record && record.id !== r.id) return this.setColumnError(item, column, 'this is a duplicate item');

    return r;
  }

  /**
   * Retrieves records from a specific sheet
   * @param sheet - Sheet name to query
   * @param processed - Whether to return processed or unprocessed records
   * @returns Promise resolving to array of BulkUploadItemEntity
   */
  protected getRecords(sheet?: string, processed = false) {
    const where: any = { bulk_upload_id: this.upload.id };

    if (sheet) where.sheet = sheet;

    if (processed) where.processed_at = Not(IsNull());
    else where.processed_at = IsNull();

    return BulkUploadItemEntity.find({ where, order: { row_num: 'asc' } });
  }

  /**
   * Retrieves manager entity by email
   * @param email - Email address of manager
   * @returns Promise resolving to EmployeeEntity or undefined
   */
  protected async getManagerId(email: string) {
    email = this.sanitizeEmail(email);
    if (!email) return;

    const user = await CommunicationUserEntity.findOne({ where: { email } });
    if (!user) return;

    return CommunicationBusinessUserEntity.findOne({ where: { business_id: this.upload.business_id, user_id: user.id } });
  }

  /**
   * Loads and updates statistics for the bulk upload
   */
  protected async loadStats() {
    const types = await this.bulkUploadService.getUploadTypes(this.upload);
    const stats = {};
    for (const type of types) {
      const sheet = type.name.toLowerCase();

      stats[sheet] = await this.getErrorCount(sheet);
    }

    this.upload.processed_at = new Date();
    this.upload.stats = { ...this.upload.stats, error: stats };

    await this.upload.save();
  }

  /**
   * Gets error count for a specific sheet
   * @private
   */
  private getErrorCount(sheet: string) {
    return BulkUploadItemEntity.count({ where: { bulk_upload_id: this.upload.id, sheet, error: Not(IsNull()) } });
  }

  /**
   * Sanitizes email address by converting to lowercase and removing mailto: prefix
   * @param email - Email address to sanitize
   * @returns Sanitized email address or null if input is empty
   */
  protected sanitizeEmail(email: string) {
    if (!email) return null;

    return email.toLowerCase().replace('mailto:', '').trim();
  }
}
