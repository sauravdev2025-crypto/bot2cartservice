import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { KeywordDetailListFilterDto } from '../dtos/keyword.detail.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered KeywordDetail
 * @export
 * @class ProcessKeywordDetailList
 */
export class ProcessKeywordDetailList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {KeywordDetailListFilterDto}
   * @memberof ProcessKeywordDetailList
   */
  protected filter: KeywordDetailListFilterDto;

  protected config = {
    sql: `bz_keyword_details a left join sys_lookup_values b on b.id  = a.matching_type_id where a.deleted_at is null`,
    order: 'sq.updated_at desc',
    columns: ['a.*', 'b.name matching_type'],
  };

  /**
   * Creates an instance of ProcessKeywordDetailList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessKeywordDetailList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {KeywordDetailListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessKeywordDetailList
   */
  async process(filter: KeywordDetailListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    await this.initialize();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessKeywordDetailList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessKeywordDetailList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
