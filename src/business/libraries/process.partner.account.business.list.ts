import { CommonListFilterDto, ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { ActionDetailsListFilterDto } from '../dtos/action.details.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all ProcessPartnerAccountBusinessList
 * @export
 * @class ProcessPartnerAccountBusinessList
 */
export class ProcessPartnerAccountBusinessList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {ActionDetailsListFilterDto}
   * @memberof ProcessPartnerAccountBusinessList
   */
  protected filter: CommonListFilterDto;

  protected config = {
    sql: `bz_business_details a left join sys_users b on b.id = a.owner_id where a.deleted_at is null`,
    order: 'sq.created_at desc',
    columns: ['a.*', 'b.name owner', 'b.email owner_email'],
  };

  /**
   * Creates an instance of ProcessPartnerAccountBusinessList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessPartnerAccountBusinessList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {ActionDetailsListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessPartnerAccountBusinessList
   */
  async process(filter: ActionDetailsListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    // await this.initialize();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessPartnerAccountBusinessList
   */
  private processFilters() {
    this.restrictions.push(`a.parent_id = ${this.business.id}`);

    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessPartnerAccountBusinessList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
