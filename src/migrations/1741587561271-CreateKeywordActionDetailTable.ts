import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateKeywordActionDetailTable1741587561271 extends MigrationUtility {
  constructor() {
    super('bz_keyword_action_details');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });

    this.foreign({ name: 'keyword_id', foreignTable: 'bz_keyword_details' });
    this.foreign({ name: 'action_id', foreignTable: 'bz_action_details' });

    this.boolean('active');

    this.json('attributes');
    this.whoColumns();
  }
}
