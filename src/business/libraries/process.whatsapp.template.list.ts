import { ListingService, ListResponseDto } from '@servicelabsco/slabs-access-manager';
import { ProcessCommunicationList } from '../../utility/libraries/process.communication.list';
import { CommunicationWhatsappTemplateListFilterDto } from '../dtos/communication.whatsapp.template.list.filter.dto';
import { BusinessEntity } from '../entities/business.entity';

/**
 * get all filtered WhatsappTemplate
 * @export
 * @class ProcessWhatsappTemplateList
 */
export class ProcessWhatsappTemplateList extends ProcessCommunicationList {
  /**
   * the filter conditions setup by the end user
   * @protected
   * @type {WhatsappTemplateListFilterDto}
   * @memberof ProcessWhatsappTemplateList
   */
  protected filter: CommunicationWhatsappTemplateListFilterDto;

  protected config = {
    sql: `bz_communication_whatsapp_templates a left join sys_languages b on b.id = a.language_id left join sys_lookup_values c on c.id = a.category_id left join sys_lookup_values d on d.id = a.status_id where a.deleted_at is null`,
    order: 'sq.updated_at desc',
    columns: [
      'a.name',
      'a.updated_at',
      'b.name language',
      'c.name category',
      'd.name status',
      'a.id',
      'a.identifier',
      'a.status_id',
      'a.category_id',
    ],
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
  async process(filter: CommunicationWhatsappTemplateListFilterDto): Promise<ListResponseDto> {
    this.filter = filter;

    this.processFilters();

    return this.handle();
  }

  /**
   * process all filter conditions passed on by the user search
   * @private
   * @memberof ProcessWhatsappTemplateList
   */
  private processFilters() {
    this.restrictions.push(`a.business_id = ${this.business.id}`);
    this.search();
  }

  /**
   * process the search filter
   * @private
   * @return {*}
   * @memberof ProcessWhatsappTemplateList
   */
  private search() {
    if (!this.filter.search) return;
    const str = this.filter.search;

    this.restrictions.push(`a.name ilike '%${str}%'`);
  }
}
