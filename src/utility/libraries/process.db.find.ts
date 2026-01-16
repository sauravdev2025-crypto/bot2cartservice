import { SqlService } from '@servicelabsco/nestjs-utility-services';
import { DbFindOptionsDto } from '@servicelabsco/slabs-access-manager';

export class ProcessDbFind {
  private options: DbFindOptionsDto;
  private limitSearchQuery = '';

  constructor(private readonly sqlService: SqlService) {}

  process(options: DbFindOptionsDto) {
    this.options = options;

    const query = this.getQuery();

    return this.sqlService.read(query);
  }

  private getQuery(): string {
    const initializedQuery = this.initializeQuery();

    const sql = `${initializedQuery} ${this.limitSearchQuery}`;

    if (!this.options?.ids?.length) return sql;

    const idsFilter = this.handleIdsFilter();

    return `(${sql}) UNION (${initializedQuery} and ${idsFilter})`;
  }

  private initializeQuery() {
    this.initializeStringSearch();
    this.initializeLimitOrder();

    const statusConditionQuery = this.handleStatusFilter();

    const conditions = `where ${this.options?.primaryCondition} ${statusConditionQuery} `;

    return `select ${this.options?.columns?.join(', ')} from ${this.options?.tableName} ${conditions}`;
  }

  private initializeStringSearch() {
    if (!this.options?.searchCompareKeys?.length || !this.options?.str) return '';

    const searches: string[] = [];

    this.options?.searchCompareKeys.forEach((item) => {
      searches.push(`${item} ilike '%${this.options?.str}%' `);
    });

    this.limitSearchQuery += `and (${searches.join(' or ')})`;
  }

  private initializeLimitOrder() {
    let sql = '';

    if (this.options.order) {
      sql += `order by ${this.options?.order} `;
    }

    const limit = this.options?.limit || 10;

    this.limitSearchQuery += `${sql} limit ${limit}`;
  }

  private handleIdsFilter() {
    if (!this.options?.ids?.length) return '';
    const idsCompareKey = this.options?.idsCompareKey || 'a.id';

    return `${idsCompareKey} in(${this.options?.ids.join(',')})`;
  }

  private handleStatusFilter() {
    if (typeof this.options.active === 'undefined') return '';

    const { statusCompareKeys, active_key } = this.options;

    const column = active_key || 'a.active';

    if (!statusCompareKeys?.length) return `and ${column} = ${this.options.active}`;

    const activeKey: string[] = [];

    statusCompareKeys?.forEach((item) => {
      activeKey.push(`${item} = ${this.options.active}`);
    });

    return `and ${activeKey.join(' and ')}`;
  }
}
