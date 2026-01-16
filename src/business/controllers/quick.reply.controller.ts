import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OperationException, SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, DbFindOptionsDto, ListingService, ProcessDbFind } from '@servicelabsco/slabs-access-manager';
import { AddQuickReplyBodyDto } from '../dtos/add.quick.reply.body.dto';
import { QuickReplyListFilterDto } from '../dtos/quick.reply.list.filter.dto';
import { QuickReplyEntity } from '../entities/quick.reply.entity';
import { ProcessCreateQuickReply } from '../libraries/process.create.quick.reply';
import { ProcessQuickReplyList } from '../libraries/process.quick.reply.list';
import { BusinessAccessService } from '../services/business.access.service';

/**
 * create controller for QuickReply
 * @export
 * @class QuickReplyController
 */
@Controller('api/b/quick-reply')
export class QuickReplyController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService
  ) {}

  @Post('search')
  async search(@Body() body: QuickReplyListFilterDto) {
    const business = await this.businessAccessService.validateAccess();

    return new ProcessQuickReplyList(business, this.listingService).process(body);
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_quick_replies a',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id}`,
      searchCompareKeys: ['a.name'],
      columns: ['a.*'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Get(':id')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return QuickReplyEntity.findOne({ where: { id: params.id, business_id: business.id } });
  }

  @Post()
  async create(@Body() body: AddQuickReplyBodyDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessCreateQuickReply(business).create(body);
  }

  @Delete(':id')
  async delete(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return QuickReplyEntity.softDelete({ id: params.id });
  }

  @Post(':id/activate')
  async activate(@Param() params: BusinessParamDto) {
    return this.handleQuickReplyStatus(true, params.id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param() params: BusinessParamDto) {
    return this.handleQuickReplyStatus(false, params.id);
  }

  async handleQuickReplyStatus(status: boolean, email_id: number) {
    const business = await this.businessAccessService.validateAccess();

    const r = await QuickReplyEntity.findOne({
      where: { id: email_id, business_id: business.id },
    });

    if (!r) throw new NotFoundException();

    if (status === r.active) throw new OperationException(`Invalid Operation`);
    r.active = status;

    return r.save();
  }
}
