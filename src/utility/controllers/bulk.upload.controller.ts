import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { AccessException, PropertyService, UploadService } from '@servicelabsco/nestjs-utility-services';
import {
  AccessBusinessService,
  BulkDefinitionEntity,
  BulkDefinitionLoadEntity,
  BulkUploadColumnEntity,
  BulkUploadEntity,
  BulkUploadItemEntity,
  BulkUploadItemListFilterDto,
  BulkUploadListFilterDto,
  BulkUploadService,
  BusinessParamDto,
  DocumentFileUploadDto,
  ListingService,
  ProcessBulkUploadItemList,
  ProcessBulkUploadList,
} from '@servicelabsco/slabs-access-manager';
import { IsNull, Not } from 'typeorm';
import { GenerateBulkUploadSheet } from '../libraries/generate.bulk.upload.sheet';

/**
 * create controller for BulkUpload
 * @export
 * @class BulkUploadController
 */
@Controller('api/b/bulk-upload')
export class BulkUploadController {
  constructor(
    private readonly accessBusinessService: AccessBusinessService,
    private readonly uploadService: UploadService,
    private readonly bulkUploadService: BulkUploadService,
    private readonly listingService: ListingService,
    private readonly propertyService: PropertyService
  ) {}

  @Post('search')
  async search(@Body() body: BulkUploadListFilterDto) {
    const business = await this.accessBusinessService.validateAccess();

    return new ProcessBulkUploadList(business, this.listingService).process(body);
  }

  @Get(':id')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.accessBusinessService.validateAccess();

    const r = await BulkUploadEntity.findOne({ where: { business_id: business.id, id: params.id }, relations: ['definition'] });

    if (!r) throw new NotFoundException();

    return r;
  }

  @Get(':id/last-record')
  async getLastRecord(@Param() params: BusinessParamDto) {
    const business = await this.accessBusinessService.validateAccess();

    return BulkUploadEntity.findOne({ where: { definition_id: params.id, business_id: business.id }, order: { id: 'DESC' } });
  }

  @Get(':id/definitions')
  async getDefinitions(@Param() params: BusinessParamDto) {
    const business = await this.accessBusinessService.validateAccess();
    const upload = await BulkUploadEntity.findOne({ where: { business_id: business.id, id: params.id } });

    if (!upload) throw new AccessException();

    upload.definition = await BulkDefinitionEntity.findOne({
      where: { id: upload.definition_id },
      relations: ['loads', 'loads.type', 'loads.type.columns', 'processings', 'processings.type', 'processings.type.columns'],
    });

    return upload;
  }

  @Post(':id/template')
  async getTemplate(@Param() params: BusinessParamDto) {
    const business = await this.accessBusinessService.validateAccess();

    return new GenerateBulkUploadSheet(this.uploadService, business).process(params.id);
  }

  @Post(':id/upload')
  async setTemplate(@Param() params: BusinessParamDto, @Body() body: DocumentFileUploadDto) {
    const business = await this.accessBusinessService.validateAccess();

    return this.bulkUploadService.setUpload(business, params.id, body);
  }

  @Get(':id/get-types')
  async summary(@Param() params: BusinessParamDto) {
    const business = await this.accessBusinessService.validateAccess();
    const upload = await BulkUploadEntity.findOne({ where: { business_id: business.id, id: params.id } });

    if (!upload) throw new AccessException();
    return BulkDefinitionLoadEntity.find({ where: { definition_id: upload.definition_id }, relations: ['type'] });
  }

  @Get(':id/get-columns/:second_id')
  async getColumns(@Param() params: BusinessParamDto) {
    const business = await this.accessBusinessService.validateAccess();
    const upload = await BulkUploadEntity.findOne({ where: { business_id: business.id, id: params.id } });
    if (!upload) throw new AccessException();

    const columns = await BulkUploadColumnEntity.find({
      where: { bulk_type_id: params.second_id, is_key_column: true },
      relations: ['column_type', 'reference_column'],
    });

    if (columns?.length > 0) return columns;

    const property = await this.propertyService.get('default.bulk.upload.columns.count', 5);
    return BulkUploadColumnEntity.find({
      where: { bulk_type_id: params.second_id },
      order: { created_at: 'ASC' },
      take: Number(property),
      relations: ['column_type', 'reference_column'],
    });
  }

  @Post(':id/search-items')
  async getItems(@Param() params: BusinessParamDto, @Body() body: BulkUploadItemListFilterDto) {
    const business = await this.accessBusinessService.validateAccess();
    const upload = await BulkUploadEntity.findOne({ where: { business_id: business.id, id: params.id } });
    if (!upload) throw new AccessException();

    return new ProcessBulkUploadItemList(this.listingService, upload).process(body);
  }

  @Get(':id/errors')
  async showLog(@Param() params: BusinessParamDto) {
    const business = await this.accessBusinessService.validateAccess();

    const r = await BulkUploadEntity.findOne({ where: { business_id: business.id, id: params.id }, relations: ['type'] });

    if (!r) throw new NotFoundException();

    const records = await BulkUploadItemEntity.find({
      where: { bulk_upload_id: r.id, error: Not(IsNull()) },
      select: ['row_num', 'data', 'error', 'errors_count'],
    });

    return records;
  }
}
