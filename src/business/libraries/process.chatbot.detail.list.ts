import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ChatbotDetailListFilterDto } from '../dtos/chatbot.detail.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';

/**
 * get all filtered ChatbotFlow
 * @export
 * @class ProcessChatbotDetailList
 */
export class ProcessChatbotDetailList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {ChatbotDetailListFilterDto}
   * @memberof ProcessChatbotDetailList
   */
  protected filter: ChatbotDetailListFilterDto;

  protected config = {
    sql: `bz_chatbot_details a left join sys_users b on a.created_by  = b.id left join bz_chatbot_versions c on c.id = a.version_id where a.deleted_at is null`,
    order: 'sq.created_at desc',
    columns: [
      'a.name',
      'a.description',
      'a.active',
      'a.attributes',
      'b.name creator',
      'a.created_at',
      'a.id',
      'c.name version_name',
      'c.published_at',
      'a.attributes',
    ],
  };

  /**
   * Creates an instance of ProcessChatbotDetailList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessChatbotDetailList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {ChatbotDetailListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessChatbotDetailList
   */
  async process(filter: ChatbotDetailListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    // await this.initialize();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessChatbotDetailList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessChatbotDetailList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
