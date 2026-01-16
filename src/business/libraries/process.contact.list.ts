import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { ContactListFilterDto } from '../dtos/contact.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered Contact
 * @export
 * @class ProcessContactList
 */
export class ProcessContactList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {ContactListFilterDto}
   * @memberof ProcessContactList
   */
  protected filter: ContactListFilterDto;

  protected config = {
    sql: `bz_contact_details a left join bz_business_users bu on bu.id = a.managed_by left join sys_users b on bu.user_id  = b.id left join bz_team_inbox c on c.contact_id = a.id and c.business_id = a.business_id where a.deleted_at is null`,
    order: 'sq.updated_at desc',
    columns: ['a.*', 'b.name manager', 'b.email manager_email', 'c.id team_inbox_id'],
  };
  /**
   * Creates an instance of ProcessContactList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessContactList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {ContactListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessContactList
   */
  async process(filter: ContactListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    // await this.initialize();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessContactList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessContactList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.mobile ILIKE '%${str}%' or a.name ILIKE '%${str}%' or a.identifier ILIKE '%${str}'`);
  }
}
