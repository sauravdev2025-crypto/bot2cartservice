import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateBusinessSettingDetailTable1758435339178 extends MigrationUtility {
  constructor() {
    super('bz_business_settings');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });
    this.boolean('is_private_number', false);

    this.json('attributes');
    this.whoColumns();
  }
}
