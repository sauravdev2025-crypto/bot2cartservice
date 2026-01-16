import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { TeamInboxListFilterDto } from '../dtos/team.inbox.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered TeamInbox
 * @export
 * @class ProcessTeamInboxMessageList
 */
export class ProcessTeamInboxMessageList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {TeamInboxListFilterDto}
   * @memberof ProcessTeamInboxMessageList
   */
  protected filter: TeamInboxListFilterDto;

  protected config = {
    sql: `bz_broadcast_messages a LEFT JOIN bz_communication_whatsapp_templates b ON b.id=a.template_id LEFT JOIN bz_broadcast_messages c ON c.id=a.parent_id LEFT JOIN sys_system_scripts d ON d.id=b.body_id LEFT JOIN sys_system_scripts e ON e.id=b.footer_id LEFT JOIN bz_communication_whatsapp_templates f ON f.id=c.template_id LEFT JOIN sys_system_scripts g ON g.id=f.body_id LEFT join sys_users h on h.id=a.created_by WHERE a.deleted_at IS NULL`,
    order: 'sq.id desc',
    columns: [
      'a.id',
      'a.webhook_response',
      'a.attributes',
      'a.scheduled_at',
      'a.sent_at',
      'a.is_log',
      'a.delivered_at',
      'a.read_at',
      'a.is_error',
      'a.response',
      'a.payload',
      'a.is_replied',
      'a.parent_id',
      'a.created_at',
      'd.script template_body',
      'e.script template_footer',
      'b.title template_title',
      'b.button_configurations template_button_configurations',
      'b.template_config template_config',
      'g.script template_parent_body',
      'g.script template_parent_body',
      'c.payload parent_payload',
      'h.name creator',
      'a.from_external_source',
    ],
  };

  /**
   * Creates an instance of ProcessTeamInboxMessageList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessTeamInboxMessageList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {TeamInboxListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessTeamInboxMessageList
   */
  async process(filter: TeamInboxListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    // await this.initialize();
    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessTeamInboxMessageList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);
    // this.restrictions.push(`a.source_type in ('${this.filter.source_type}', '${SourceHash.ScheduleBroadcast}')`);
    this.restrictions.push(`a.mobile = '${this.filter.mobile}'`);

    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessTeamInboxMessageList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
