import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateActionDetailsTable1741586354889 extends MigrationUtility {
  constructor() {
    super('bz_action_details');
    this.process();
  }

  process() {
    this.primary();

    this.string('name');

    this.json('parameters');
    this.foreign({ foreignTable: 'bz_business_details', name: 'business_id' });
    this.foreign({ foreignTable: 'sys_lookup_values', name: 'type_id' });

    this.boolean('active', true);

    this.json('attributes');
    this.whoColumns();
  }
}
