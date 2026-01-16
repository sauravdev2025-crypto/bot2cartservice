import { DateUtil, OperationException, PlatformUtility, UploadService } from '@servicelabsco/nestjs-utility-services';
import {
  AccessBusinessEntity,
  BulkDefinitionEntity,
  BulkDefinitionLoadEntity,
  BulkUploadColumnEntity,
  BulkUploadTypeEntity,
  ChoiceListEntity,
  ChoiceTypeEntity,
  CustomFieldEntity,
} from '@servicelabsco/slabs-access-manager';
import SourceHash from '../../config/source.hash';
import ExcelJS = require('exceljs');

export class GenerateBulkUploadSheet {
  private workbook;
  private sheets = {};
  private choiceListTypes: number[] = [];

  constructor(
    private readonly uploadService: UploadService,
    private readonly business: AccessBusinessEntity
  ) {}

  async process(id: number) {
    const definition = await BulkDefinitionEntity.first(id);
    if (!definition) throw new OperationException('Invalid definition');
    if (definition?.attributes?.file_url) return { file: definition.attributes.file_url };

    this.init();

    const items: BulkUploadTypeEntity[] = await this.getBulkUploadTypes(id);

    this.createSheets(items);

    for (const item of items) {
      await this.loadData(item);
    }

    const file = await this.getFile();

    return { file };
  }

  private createSheets(items: any) {
    items.forEach((item) => {
      this.sheets[item.name] = this.workbook.addWorksheet(item.name.replace(/[^a-zA-Z0-9 ]/g, '_'));
    });
  }
  private init() {
    this.workbook = new ExcelJS.Workbook();
  }

  private async loadData(item: BulkUploadTypeEntity) {
    const worksheet = this.sheets[item.name];

    const metadata = await this.getColumns(item.source_type);

    let data = [];
    if (!item.attributes?.no_data) data = await this.getData(metadata.type);

    await this.writeToWorksheet(worksheet, metadata, data);
  }

  private async setHeader(
    worksheet: any,
    metadata: { type: BulkUploadTypeEntity; columns: BulkUploadColumnEntity[]; customColumns: CustomFieldEntity[] }
  ) {
    worksheet.getCell('A1').value = 'SN';

    let i = 1;
    for (const column of metadata.columns || []) {
      const cell = this.getCell(1, i);
      worksheet.getCell(cell).value = column.name;

      await this.setHeaderValidation(worksheet, i, column);
      ++i;
    }

    if (!metadata.customColumns) return;

    for (const column of metadata.customColumns || []) {
      const cell = this.getCell(1, i);
      worksheet.getCell(cell).value = column.identifier;

      if (column.choice_type_id) {
        await this.setListValidation(worksheet, i, column.choice_type_id);
      }

      ++i;
    }

    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  }

  private async setHeaderValidation(worksheet: any, index: number, column: BulkUploadColumnEntity) {
    if (!column.reference_column_id) return;

    const columnPrefix = this.getColumnPrefix(index);
    const sheet = column.reference_column.bulk_type.name.toLowerCase();
    const refIndex = this.getColumnPrefix(column.reference_column.priority);

    this.setValidation(worksheet, columnPrefix, sheet, refIndex);
  }

  private getCell(row: number, i: number) {
    const str = this.getColumnPrefix(i);
    return `${str}${row}`;
  }

  private getColumnPrefix(i: number, pre?: number) {
    let prefix = '';
    if (pre) prefix = this.getColumnPrefix(pre - 1);

    const quotient = Math.floor(i / 26);
    const fraction = i % 26;

    if (quotient) return this.getColumnPrefix(fraction, quotient);

    const str = String.fromCharCode(65 + fraction);
    return `${prefix}${str}`;
  }

  private async getColumns(source_type: string) {
    const type = await BulkUploadTypeEntity.findOne({ where: { source_type } });

    const columns = await BulkUploadColumnEntity.find({
      where: { bulk_type_id: type.id },
      order: { priority: 'asc' },
      relations: ['column_type', 'reference_column', 'reference_column.bulk_type'],
    });

    let customColumns;

    if (type.custom_field_id)
      customColumns = await CustomFieldEntity.find({
        where: { business_id: this.business.id, type_id: type.custom_field_id, active: true },
        order: { priority: 'ASC' },
      });

    return { type, columns, customColumns };
  }

  private async getData(type: BulkUploadTypeEntity) {
    const entity = PlatformUtility.getEntity(type.source_type);
    const relations = this.getRelations(type.relations);

    let where: any = {};
    if (!type?.attributes?.is_global) where.business_id = this.business.id;

    if (type?.attributes?.where) {
      where = { ...where, ...type?.attributes?.where };
    }

    if (typeof type?.attributes?.business_relation === 'string') {
      where[type?.attributes?.business_relation] = {
        business_id: this.business?.id,
      };
    }

    return entity.find({ where, relations, order: { id: 'ASC' } });
  }

  private getRelations(relations: string) {
    return relations ? relations.split(',') : [];
  }

  private getDBValue(record: any, column: string) {
    const items = column.split('.');

    let data = record;

    items.forEach((item) => {
      if (!data) return;

      data = data[item];
    });

    return data;
  }

  private async getCustomFieldValue(record: any, customField: CustomFieldEntity) {
    await this.createChoiceListSheet(customField.choice_type_id);

    if (customField.choice_type_id) return this.getChoiceValue(record.custom_field_data?.[customField.identifier]);

    return record.custom_field_data?.[customField?.identifier] || '';
  }

  private async getChoiceValue(id: number) {
    if (!id) return;

    const r = await ChoiceListEntity.first(id);

    return r.name;
  }

  private async getFile() {
    const buffer = await this.workbook.xlsx.writeBuffer();

    const originalname = `i-${this.business.identifier}-${PlatformUtility.generateRandomAlphaNumeric(
      6
    ).toLowerCase()}-${DateUtil.getDateInFormat()}.xlsx`;

    return this.uploadService.upload({ buffer, originalname }, { folder: 'public/bulk' });
  }

  private async createChoiceListSheet(id: number) {
    if (!id) return;
    if (this.choiceListTypes.includes(id)) return;

    this.choiceListTypes.push(id);
    const type = await ChoiceTypeEntity.first(id);

    const worksheet = this.workbook.addWorksheet(`c-${type.name.replace(/[^a-zA-Z0-9 ]/g, '_').toLowerCase()}`);

    const metadata = await this.getColumns(SourceHash.choiceList);
    const data = await ChoiceListEntity.find({ where: { type_id: id, active: true }, order: { name: 'asc' } });

    await this.writeToWorksheet(worksheet, metadata, data);
  }

  private async writeToWorksheet(worksheet: any, metadata: any, data: any[]) {
    await this.setHeader(worksheet, metadata);

    let row = 2;
    for (const item of data) {
      worksheet.getCell(`A${row}`).value = row - 1;

      let counter = 0;

      for (const column of metadata.columns || []) {
        ++counter;
        let value: any;

        if (column?.attributes?.source_type) {
          value = await this.getSourceData(column, item?.source_id);
        } else {
          value = this.getDBValue(item, column.reference_field);
        }

        const cell = this.getCell(row, counter);

        worksheet.getCell(cell).value = value;
      }

      if (metadata.customColumns) {
        for (const column of metadata.customColumns) {
          ++counter;

          const value = await this.getCustomFieldValue(item, column);
          const cell = this.getCell(row, counter);
          worksheet.getCell(cell).value = value;
        }
      }

      ++row;
    }
  }

  async getSourceData(column: any, sourceId: number) {
    const entity = await PlatformUtility.getEntity(column?.attributes?.source_type);
    const record = await entity.first(sourceId);
    return record[column?.attributes?.source_identifier];
  }

  private async setListValidation(worksheet: any, index: number, typeId: number) {
    const type = await ChoiceTypeEntity.first(typeId);
    const columnPrefix = this.getColumnPrefix(index);

    this.setValidation(worksheet, columnPrefix, `c-${type.name.toLowerCase()}`, 'C');
  }

  private setValidation(worksheet: any, sourceColumn: string, sheet: string, destinationColumn: string) {
    worksheet.dataValidations.add(`${sourceColumn}2:${sourceColumn}9999`, {
      type: 'list',
      allowBlank: true,
      formulae: [`'${sheet}'!$${destinationColumn}$2:$${destinationColumn}$600`],
      showErrorMessage: true,
      errorStyle: 'error',
    });
  }

  private async getBulkUploadTypes(typeId: number) {
    const loads = await BulkDefinitionLoadEntity.find({
      where: { definition_id: typeId, active: true },
      relations: ['type'],
      order: { priority: 'ASC' },
    });

    const items = [];

    for (const load of loads) {
      const type = load.type;

      type.name = type.name.toLowerCase();
      items.push(type);
    }

    return items;
  }
}
