import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { ScheduleBroadcastListFilterDto } from '../dtos/schedule.broadcast.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered ScheduleBroadcast
 * @export
 * @class ProcessScheduleBroadcastList
 */
export class ProcessScheduleBroadcastList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {ScheduleBroadcastListFilterDto}
   * @memberof ProcessScheduleBroadcastList
   */
  protected filter: ScheduleBroadcastListFilterDto;

  protected config = {
    sql: `bz_schedule_broadcast a left join bz_communication_whatsapp_templates b on b.id = a.template_id where a.deleted_at is null`,
    order: 'sq.created_at desc',
    columns: ['a.*', 'b.name template_name'],
  };

  /**
   * Creates an instance of ProcessOrderList.
   * @param {BusinessEntity} business
   * @param {ListingService} listingService
   * @memberof ProcessWhatsappTemplateList
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
   * @param {WhatsappTemplateListFilterDto} filter
   * @return {*}  {Promise<ListResponseDto>}
   * @memberof ProcessWhatsappTemplateList
   */
  async process(filter: ScheduleBroadcastListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessScheduleBroadcastList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessScheduleBroadcastList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
