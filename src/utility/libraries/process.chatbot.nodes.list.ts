import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { BusinessEntity } from '../../business/entities/business.entity';
import { ChatbotNodesListFilterDto } from '../dtos/chatbot.nodes.list.filter.dto';
import { ProcessCommunicationList } from './process.communication.list';

/**
 * get all filtered ChatbotNodes
 * @export
 * @class ProcessChatbotNodesList
 */
export class ProcessChatbotNodesList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {ChatbotNodesListFilterDto}
   * @memberof ProcessChatbotNodesList
   */
  protected filter: ChatbotNodesListFilterDto;

  protected config = {
    sql: `utl_chatbot_nodes a where a.deleted_at is null`,
    order: 'sq.created_at desc',
    columns: ['a.*'],
  };

  /**
   * Creates an instance of ProcessChatbotNodesList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessChatbotNodesList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {ChatbotNodesListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessChatbotNodesList
   */
  async process(filter: ChatbotNodesListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    await this.initialize();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessChatbotNodesList
   */
  private processFilters() {
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessChatbotNodesList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
