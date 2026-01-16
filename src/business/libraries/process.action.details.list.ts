import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { ActionDetailsListFilterDto } from '../dtos/action.details.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered ActionDetails
 * @export
 * @class ProcessActionDetailsList
 */
export class ProcessActionDetailsList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {ActionDetailsListFilterDto}
   * @memberof ProcessActionDetailsList
   */
  protected filter: ActionDetailsListFilterDto;

  protected config = {
    sql: `bz_action_details a left join sys_lookup_values b on b.id = a.type_id where a.deleted_at is null`,
    order: 'sq.created_at desc',
    columns: ['a.*', 'b.name type'],
  };

  /**
   * Creates an instance of ProcessActionDetailsList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessActionDetailsList
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
   * @memberof ProcessActionDetailsList
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
   * @memberof ProcessActionDetailsList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);

    if (this.filter.type_id) this.restrictions.push(`a.type_id = ${this.filter.type_id}`);
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessActionDetailsList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
