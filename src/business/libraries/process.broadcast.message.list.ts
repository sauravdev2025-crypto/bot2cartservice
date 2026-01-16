import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { BroadcastMessageListFilterDto } from '../dtos/broadcast.message.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered BroadcastMessage
 * @export
 * @class ProcessBroadcastMessageList
 */
export class ProcessBroadcastMessageList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {BroadcastMessageListFilterDto}
   * @memberof ProcessBroadcastMessageList
   */
  protected filter: BroadcastMessageListFilterDto;

  protected config = {
    sql: `bz_broadcast_messages a left join bz_communication_whatsapp_templates b on b.id = a.template_id where a.deleted_at is null`,
    order: 'sq.created_at desc',
    columns: ['a.*', 'b.name template_name'],
  };

  /**
   * Creates an instance of ProcessBroadcastMessageList.
   * @param {SqlService} sqlService
   * @param {BusinessEntity} business
   * @memberof ProcessBroadcastMessageList
   */
  constructor(
    protected readonly business: BusinessEntity,
    protected readonly listingService: ListingService
  ) {
    super();
  }

  /**
   * entry point for the processing of list records
   * @param {BroadcastMessageListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessBroadcastMessageList
   */
  async process(filter: BroadcastMessageListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessBroadcastMessageList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);

    this.restrictions.push(`a.source_type = '${this.filter.source_type}'`);
    this.restrictions.push(`a.source_id = ${this.filter.source_id}`);

    this.filterBooleanColumn('is_error', 'a.is_error');
    this.filterStatus();

    this.search();
  }

  private filterStatus() {
    const value = this.filter.status;
    if (!value) return;

    this.restrictions.push(`a.${value} is not null`);
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessBroadcastMessageList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.mobile ilike '%${str}%'`);
  }
}
