import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { BusinessUserInvitationListFilterDto } from '../dtos/business.user.invitation.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered BusinessUserInvitation
 * @export
 * @class ProcessBusinessUserInvitationList
 */
export class ProcessBusinessUserInvitationList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {BusinessUserInvitationListFilterDto}
   * @memberof ProcessBusinessUserInvitationList
   */
  protected filter: BusinessUserInvitationListFilterDto;

  protected config = {
    sql: `bz_user_invitations a left join utl_role_groups b on b.id = a.role_id where a.deleted_at is null`,
    order: 'sq.created_at asc',
    columns: ['a.*', 'b.name role'],
    metrics: [],
  };

  /**
   * Creates an instance of ProcessBusinessUserInvitationList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessBusinessUserInvitationList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {BusinessUserInvitationListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessBusinessUserInvitationList
   */
  async process(filter: BusinessUserInvitationListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    // await this.initialize();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessBusinessUserInvitationList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessBusinessUserInvitationList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
