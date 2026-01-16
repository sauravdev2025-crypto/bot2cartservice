import { Auth } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserRoleEntity, ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { SystemRolesConstants } from '../constants/system.roles.constants';
import { TeamInboxListFilterDto } from '../dtos/team.inbox.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';
import { CommunicationBusinessUserEntity } from '../entities/communication.business.user.entity';
import { BusinessUserService } from '../services/business.user.service';

/**
 * get all filtered TeamInbox
 * @export
 * @class ProcessTeamInboxList
 */
export class ProcessTeamInboxList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {TeamInboxListFilterDto}
   * @memberof ProcessTeamInboxList
   */
  protected filter: TeamInboxListFilterDto;

  protected config = {
    sql: `bz_team_inbox a left join bz_contact_details b on a.contact_id  = b.id left join sys_lookup_values c on c.id = a.status_id where a.deleted_at is null`,
    order: 'COALESCE(sq.last_activity_at, sq.created_at) DESC',
    columns: [
      'a.*',
      'b.display_name contact_name',
      'b.display_name contact_display_name',
      'b.dialing_code',
      'b.mobile',
      'b.allow_broadcast',
      'b.is_assigned_to_bot',
    ],
  };

  /**
   * Creates an instance of ProcessTeamInboxList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessTeamInboxList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService,
    protected readonly businessUserService: BusinessUserService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {TeamInboxListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessTeamInboxList
   */
  async process(filter: TeamInboxListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    // await this.initialize();
    await this.filterVisibility();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessTeamInboxList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);

    if (this.filter.assignee_ids?.length) this.restrictions.push(`a.assignee_id in (${this.filter.assignee_ids.join(',')})`);
    if (this.filter.status_ids?.length) this.restrictions.push(`a.status_id in (${this.filter.status_ids?.join(',')})`);
    if (this.filter.is_assigned_to_bot) this.restrictions.push(`b.is_assigned_to_bot = True`);

    if (this.filter.active_chat) this.restrictions.push(`a.only_broadcast = ${this.filter.active_chat}`);
    if (this.filter.is_expired) this.restrictions.push(`a.expired_at is not null and a.only_broadcast = false`);
    if (this.filter.unread) this.restrictions.push(`(a.attributes ->> 'unread_count')::int > 0`);

    this.search();
  }

  private async filterVisibility() {
    const bu = await CommunicationBusinessUserEntity.findOne({ where: { business_id: this.business.id, user_id: Auth.user().id } });
    const businessUserRole = await BusinessUserRoleEntity.findOne({ where: { business_user_id: bu.id }, relations: ['role_group'] });
    const role = businessUserRole?.role_group;

    if (role.name === SystemRolesConstants.CHAT_AGENT) {
      const ids = [bu?.id, bu?.manager_id].filter(Boolean).join(',');
      this.restrictions.push(`(a.assignee_id in (${ids}))`);
    }
    if (role.name === SystemRolesConstants.AGENT_MANAGER) {
      const data = await this.businessUserService.getAllManagers(bu?.id);
      const ids = data?.filter(Boolean).join(',');
      this.restrictions.push(`a.assignee_id is null or a.assignee_id in (${ids})`);
    }
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessTeamInboxList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(
      `b.display_name ilike '%${str}%' or b.wa_id ilike '%${str}%' or b.mobile ilike '%${str}%' or b.identifier ilike '%${str}%'`
    );
  }
}
