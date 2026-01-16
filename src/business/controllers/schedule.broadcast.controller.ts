import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OperationException, SourceColumnDto, SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, DbFindOptionsDto, ListingService, ProcessDbFind } from '@servicelabsco/slabs-access-manager';
import SourceHash from '../../config/source.hash';
import { BroadcastMessageListFilterDto } from '../dtos/broadcast.message.list.filter.dto';
import { ScheduleBroadcastDto } from '../dtos/schedule.broadcast.dto';
import { ScheduleBroadcastListFilterDto } from '../dtos/schedule.broadcast.list.filter.dto';
import { ScheduleBroadcastEntity } from '../entities/schedule.broadcast.entity';
import { ProcessBroadcastMessageList } from '../libraries/process.broadcast.message.list';
import { ProcessScheduleBroadcast } from '../libraries/process.schedule.broadcast.';
import { ProcessScheduleBroadcastList } from '../libraries/process.schedule.broadcast.list';
import { BusinessAccessService } from '../services/business.access.service';

/**
 * create controller for ScheduleBroadcast
 * @export
 * @class ScheduleBroadcastController
 */
@Controller('api/b/schedule-broadcast')
export class ScheduleBroadcastController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService
  ) {}

  @Post('search')
  async search(@Body() body: ScheduleBroadcastListFilterDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessScheduleBroadcastList(business, this.listingService).process(body);
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_schedule_broadcast a',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id}`,
      searchCompareKeys: ['a.name'],
      columns: ['a.*'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Post(':id/messages')
  async getMessages(@Body() body: BroadcastMessageListFilterDto, @Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    const source: SourceColumnDto = {
      source_id: params.id,
      source_type: SourceHash.ScheduleBroadcast,
    };

    return new ProcessBroadcastMessageList(business, this.listingService).process({ ...body, ...source });
  }

  @Get(':id')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return ScheduleBroadcastEntity.findOne({
      where: { id: params.id, business_id: business.id },
      relations: ['template.category', 'template.language', 'updator'],
    });
  }

  @Delete(':id')
  async delete(@Param() _params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    const data = await ScheduleBroadcastEntity.findOne({
      where: { id: _params.id, business_id: business.id },
    });

    if (data?.initiated_at) throw new OperationException('This cannot be deleted');
    if (!data) throw new OperationException('Invalid data');

    return data.softDelete();
  }

  @Post()
  async create(@Body() _body: ScheduleBroadcastDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessScheduleBroadcast(business).process(_body);
  }
}
