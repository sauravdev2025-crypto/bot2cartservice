import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OperationException, SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, DbFindOptionsDto, ListingService, ProcessDbFind } from '@servicelabsco/slabs-access-manager';
import { ChatbotDetailListFilterDto } from '../dtos/chatbot.detail.list.filter.dto';
import { CreateChatbotDetailDto } from '../dtos/create.chatbot.detail.dto';
import { CreateChatbotVersionDto } from '../dtos/create.chatbot.version.dto';
import { ChatbotDetailEntity } from '../entities/chatbot.detail.entity';
import { ChatbotVersionEntity } from '../entities/chatbot.version.entity';
import { ProcessChatbotDetailList } from '../libraries/process.chatbot.detail.list';
import { BusinessAccessService } from '../services/business.access.service';

/**
 * create controller for ChatbotFlow
 * @export
 * @class ChatbotFlowController
 */
@Controller('api/b/chatbot')
export class ChatbotDetailController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService
  ) {}

  @Post('search')
  async search(@Body() body: ChatbotDetailListFilterDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessChatbotDetailList(business, this.listingService).process(body);
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_chatbot_details a left join bz_chatbot_versions b on b.id = a.version_id',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id} and a.version_id is not null`,
      searchCompareKeys: ['a.name'],
      columns: ['a.name', 'a.description', 'a.id', 'a.business_id', 'a.active', 'b.name version_name'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Get(':id/version-detail')
  async showVersion(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return ChatbotVersionEntity.first(params.id, { relations: ['chatbot'] });
  }

  @Get(':id')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return ChatbotDetailEntity.findOne({ where: { id: params.id, business_id: business.id }, relations: ['version'] });
  }

  @Post()
  async create(@Body() body: CreateChatbotDetailDto) {
    const business = await this.businessAccessService.validateAccess();
    let flow = ChatbotDetailEntity.create({ business_id: business.id });

    if (body?.id) flow = await ChatbotDetailEntity.first(body.id);

    flow.name = body.name;
    flow.description = body.description;
    flow.active = true;

    return flow.save();
  }

  @Delete(':id')
  async delete(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return ChatbotDetailEntity.softDelete({ id: params.id });
  }

  @Post(':id/activate')
  async activate(@Param() params: BusinessParamDto) {
    return this.handleChatbotFlowStatus(true, params.id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param() params: BusinessParamDto) {
    return this.handleChatbotFlowStatus(false, params.id);
  }

  async handleChatbotFlowStatus(status: boolean, flow_id: number) {
    const business = await this.businessAccessService.validateAccess();

    const r = await ChatbotDetailEntity.findOne({
      where: { id: flow_id, business_id: business.id },
    });

    if (!r) throw new NotFoundException();

    if (status === r.active) throw new OperationException(`Invalid Operation`);
    r.active = status;

    return r.save();
  }

  // version related

  @Delete(':id/delete-version')
  async deleteVersion(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return ChatbotVersionEntity.softDelete({ id: params.id });
  }
  @Post(':id/find-version')
  async findVersion(@Body() body: StringSearchDto, @Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_chatbot_versions a',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id} and a.chatbot_id = ${params.id} `,
      searchCompareKeys: ['a.name', 'a.published_at'],
      columns: ['a.name', 'a.id', 'a.business_id'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Post(':id/create-version')
  async createVersion(@Body() body: CreateChatbotVersionDto, @Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    let flowV = ChatbotVersionEntity.create({ business_id: business.id, chatbot_id: params.id });
    if (body.id) flowV = await ChatbotVersionEntity.first(body.id);

    flowV.raw_react_flow = body.raw_react_flow;
    flowV.name = body.name;

    return flowV.save();
  }

  @Post(':id/assign-publish')
  async assignPublishedVersion(@Param() params: BusinessParamDto) {
    await this.businessAccessService.validateAccess();

    const version = await ChatbotVersionEntity.first(params.id);
    const chatbot = await ChatbotDetailEntity.first(version.chatbot_id);

    chatbot.version_id = version.id;
    chatbot.raw_react_flow = version.raw_react_flow;

    return chatbot.save();
  }

  @Post(':id/publish-version')
  async publishVersion(@Param() params: BusinessParamDto) {
    await this.businessAccessService.validateAccess();
    const flowV = await ChatbotVersionEntity.first(params.id);
    flowV.published_at = new Date();
    return flowV.save();
  }
}
