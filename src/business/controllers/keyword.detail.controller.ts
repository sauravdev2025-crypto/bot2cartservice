import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OperationException, SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, DbFindOptionsDto, ListingService, ProcessDbFind } from '@servicelabsco/slabs-access-manager';
import { CreateKeywordDetailDto } from '../dtos/create.keyword.detail.dto';
import { KeywordDetailListFilterDto } from '../dtos/keyword.detail.list.filter.dto';
import { KeywordActionDetailEntity } from '../entities/keyword.action.detail.entity';
import { KeywordDetailEntity } from '../entities/keyword.detail.entity';
import { ProcessCreateKeywordDetails } from '../libraries/process.create.keyword.details';
import { ProcessKeywordDetailList } from '../libraries/process.keyword.detail.list';
import { BusinessAccessService } from '../services/business.access.service';

/**
 * create controller for KeywordDetail
 * @export
 * @class KeywordDetailController
 */
@Controller('api/b/keyword-details')
export class KeywordDetailController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService
  ) {}

  @Post('search')
  async search(@Body() body: KeywordDetailListFilterDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessKeywordDetailList(business, this.listingService).process(body);
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_keyword_details a',
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
    return KeywordDetailEntity.findOne({ where: { id: params.id, business_id: business.id }, relations: ['matching_type', 'actions.action'] });
  }

  @Post()
  async create(@Body() body: CreateKeywordDetailDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessCreateKeywordDetails(business).process(body);
  }

  @Get(':id/get-actions')
  async getActions(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    return KeywordActionDetailEntity.find({
      where: {
        keyword_id: params.id,
        business_id: business.id,
      },
      relations: ['keyword', 'action'],
    });
  }

  @Delete(':id')
  async delete(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const keyword = await KeywordDetailEntity.findOne({ where: { business_id: business.id, id: params.id } });

    if (!keyword) throw new OperationException('Invalid keyword');

    const keywordActions = await KeywordActionDetailEntity.find({ where: { keyword_id: keyword?.id } });

    for await (const keyword of keywordActions) {
      const data = await KeywordActionDetailEntity.first(keyword?.id);
      await data?.softDelete();
    }

    return keyword.softDelete();
  }

  @Post(':id/activate')
  async activate(@Param() params: BusinessParamDto) {
    return this.handleKeywordStatus(true, params.id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param() params: BusinessParamDto) {
    return this.handleKeywordStatus(false, params.id);
  }

  async handleKeywordStatus(status: boolean, id: number) {
    const business = await this.businessAccessService.validateAccess();

    const r = await KeywordDetailEntity.findOne({
      where: { id: id, business_id: business.id },
    });

    if (!r) throw new NotFoundException();

    if (status === r.active) throw new OperationException(`Invalid Operation`);
    r.active = status;

    return r.save();
  }
}
