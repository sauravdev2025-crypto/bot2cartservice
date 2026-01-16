import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateKeywordDetailTable1741583531749 extends MigrationUtility {
  constructor() {
    super('bz_keyword_details');
    this.process();
  }

  process() {
    this.primary();

    this.string('name');

    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });
    this.foreign({ name: 'matching_type_id', foreignTable: 'sys_lookup_values' });

    this.boolean('active', true);
    this.json('keywords');

    this.json('attributes');
    this.whoColumns();
  }
}
