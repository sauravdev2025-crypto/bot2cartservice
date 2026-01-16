import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { QuickReplyListFilterDto } from '../dtos/quick.reply.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';

/**
 * get all filtered QuickReply
 * @export
 * @class ProcessQuickReplyList
 */
export class ProcessQuickReplyList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {QuickReplyListFilterDto}
   * @memberof ProcessQuickReplyList
   */
  protected filter: QuickReplyListFilterDto;

  protected config = {
    sql: `bz_quick_replies a left join sys_users b on a.updated_by  = b.id where a.deleted_at is null`,
    order: 'sq.updated_at desc',
    columns: ['a.*', 'b.name creator'],
  };

  /**
   * Creates an instance of ProcessQuickReplyList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessQuickReplyList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {QuickReplyListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessQuickReplyList
   */
  async process(filter: QuickReplyListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    // await this.initialize();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessQuickReplyList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessQuickReplyList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
