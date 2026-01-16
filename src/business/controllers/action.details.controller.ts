import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, DbFindOptionsDto, ListingService, ProcessDbFind } from '@servicelabsco/slabs-access-manager';
import { ActionDetailsListFilterDto } from '../dtos/action.details.list.filter.dto';
import { CreateActionDetailDto } from '../dtos/create.action.detail.dto';
import { ActionDetailsEntity } from '../entities/action.details.entity';
import { ProcessActionDetailsList } from '../libraries/process.action.details.list';
import { ProcessCreateActionDetail } from '../libraries/process.create.action.detail';
import { BusinessAccessService } from '../services/business.access.service';

/**
 * create controller for ActionDetails
 * @export
 * @class ActionDetailsController
 */
@Controller('api/b/action-details')
export class ActionDetailsController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService
  ) {}

  @Post('search')
  async search(@Body() body: ActionDetailsListFilterDto) {
    const business = await this.businessAccessService.validateAccess();

    return new ProcessActionDetailsList(business, this.listingService).process(body);
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_action_details a',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id}`,
      searchCompareKeys: ['a.name'],
      columns: ['a.id', 'a.type_id', 'jsonb(a.parameters) parameters', 'a.active', 'a.name'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Get(':id')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return ActionDetailsEntity.findOne({ where: { id: params.id, business_id: business.id }, relations: ['type'] });
  }

  @Post()
  async create(@Body() body: CreateActionDetailDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessCreateActionDetail(business).process(body);
  }

  @Delete(':id')
  async delete(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return ActionDetailsEntity.softDelete({ id: params.id });
  }
}
