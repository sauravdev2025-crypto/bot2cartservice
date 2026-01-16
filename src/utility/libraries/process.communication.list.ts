import { OperationException } from '@servicelabsco/nestjs-utility-services';
import {
  CustomFieldService,
  ListingColumnEntity,
  ListingPageEntity,
  ListingService,
  ProcessCommonList,
  ProcessCommonListConfigDto,
} from '@servicelabsco/slabs-access-manager';
import { BusinessEntity } from '../../business/entities/business.entity';

export class ProcessCommunicationList extends ProcessCommonList {
  protected customFieldService: CustomFieldService;
  protected business: BusinessEntity;
  protected filter: any;
  protected config: ProcessCommonListConfigDto;
  protected listingService: ListingService;

  protected async setCustomColumn(alias: string, type: number) {
    const r = await this.customFieldService.getSqlCustomData(this.business.id, alias, type);

    this.config.columns = [...this.config.columns, ...r.columns];

    for (const table of r.tables) {
      this.config.sql = `${this.config.sql}  left join ${table}`;
    }

    this.config.sql = `${this.config.sql}  where a.deleted_at is null`;
  }

  protected filterActive() {
    if (!this.isBooleanFieldSet('active')) return;
    this.restrictions.push(`a.active = ${this.filter.active}`);
  }

  protected isBooleanFieldSet(field: string) {
    return typeof this.filter[field] !== 'undefined';
  }

  /**
   * @description initializing the listing columns and sql.
   * if the sql and column are defined then it will return else continue the process
   *
   * @memberof ProcessCommonFinnotoList
   */
  async initialize() {
    if (this.config.columns?.length || Boolean(this.config?.sql)) return;

    const { query, id, order_definition } = (await this.getScripts()) || {};
    this.config.sql = query?.script;
    this.config.order = order_definition ?? '';

    const columns = await this.getColumns(id);

    if (!this.config?.columns?.length) {
      this.config.columns = columns;
    }
  }

  /**
   * @description Getting the Scripts from the sys_system_scripts
   *
   * @memberof ProcessCommonFinnotoList
   */
  protected async getScripts() {
    if (!this.filter.listing_slug) throw new OperationException('Listing slug was not provided');

    const listingPage = await ListingPageEntity.findOne({ where: { identifier: this.filter.listing_slug }, relations: ['query'] });

    if (!listingPage?.query_id) return;

    return listingPage;
  }

  /**
   * @description Getting the Columns Definition
   *
   * @memberof ProcessCommonFinnotoList
   */
  protected async getColumns(listing_id: number) {
    const listingColumns = await ListingColumnEntity.find({ where: { listing_id } });
    if (!listingColumns) return;

    return listingColumns.flatMap((col) => {
      if (!col.db_identifier) return [];

      return [`${col.db_identifier} ${col.identifier ?? ''} `];
    });
  }

  /**
   * filter against a given boolean column
   * @protected
   * @param {string} field
   * @param {string} column
   * @return void
   * @memberof ProcessCommonFinnotoList
   */
  protected filterBooleanColumn(field: string, column: string) {
    if (!this.isBooleanFieldSet(field)) return;

    this.restrictions.push(`${column} = ${this.filter[field]}`);
  }
}
