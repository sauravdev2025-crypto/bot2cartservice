import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { BusinessUserListFilterDto } from '../dtos/business.user.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered settlements
 * @export
 * @class ProcessBusinessUserList
 */
export class ProcessBusinessUserList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {EmployeeListFilterDto}
   * @memberof ProcessBusinessUserList
   */
  protected filter: BusinessUserListFilterDto;

  protected config = {
    sql: `bz_business_users a left join sys_users b on a.user_id = b.id left join bz_business_user_roles c on c.business_user_id = a.id and c.deleted_at is null left join utl_role_groups d on d.id = c.role_group_id left join bz_business_users e on e.id = a.manager_id left join sys_users f on f.id = e.user_id where a.deleted_at is null`,
    order: 'sq.name asc',
    columns: ['b.name', 'b.email', 'a.*', 'b.mobile', 'b.dialing_code', 'd.name role', 'd.id role_id', 'f.name manager_name'],
    metrics: [],
  };

  /**
   * Creates an instance of ProcessBusinessUserList.
   * @param {SqlService} sqlService
   * @param {ListingService} listingService
   * @memberof ProcessBusinessUserList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();

    this.restrictions.push(`a.business_id = ${this.business.id}`);
  }

  /**
   * entry point for the processing of list records
   * @param {BusinessUserListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessBusinessUserList
   */
  async process(filter: BusinessUserListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessBusinessUserList
   */
  private processFilters() {
    this.setRoleFilter();
    this.search();
  }
  private setRoleFilter() {
    if (!this.filter.role) return;
    this.restrictions.push(`d.name = '${this.filter.role}'`);
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessBusinessUserList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`b.name ilike '%${str}%' or b.email ilike '%${str}%' `);
  }
}
