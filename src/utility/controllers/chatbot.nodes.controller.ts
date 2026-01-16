import { Body, Controller, Post } from '@nestjs/common';
import { SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { DbFindOptionsDto, ListingService, ProcessDbFind } from '@servicelabsco/slabs-access-manager';
import { BusinessAccessService } from '../../business/services/business.access.service';
import { ChatbotNodesListFilterDto } from '../dtos/chatbot.nodes.list.filter.dto';
import { ProcessChatbotNodesList } from '../libraries/process.chatbot.nodes.list';

/**
 * create controller for ChatbotNodes
 * @export
 * @class ChatbotNodesController
 */
@Controller('api/b/chatbot-nodes')
export class ChatbotNodesController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService
  ) {}

  @Post('search')
  async search(@Body() body: ChatbotNodesListFilterDto) {
    const business = await this.businessAccessService.validateAccess();

    return new ProcessChatbotNodesList(business, this.listingService).process(body);
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'utl_chatbot_nodes a',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id}`,
      searchCompareKeys: ['a.name'],
      columns: ['a.*'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }
}
