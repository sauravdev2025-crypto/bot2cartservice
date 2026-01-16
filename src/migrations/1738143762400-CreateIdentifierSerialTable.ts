import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateIdentifierSerialTable1738143762400 extends MigrationUtility {
  constructor() {
    super('utl_identifier_serials');
    this.process();
  }

  process() {
    this.primary();

    this.string('value');
    this.foreign({ name: 'prefix_id', foreignTable: 'sys_lookup_values' });

    this.json('attributes');
    this.whoColumns();

    this.index(['value'], 'utl_identifier_serials_value_index');
  }
}
