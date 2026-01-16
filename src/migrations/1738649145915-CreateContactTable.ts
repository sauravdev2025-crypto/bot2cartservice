import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateContactTable1738649145915 extends MigrationUtility {
  constructor() {
    super('bz_contact_details');
    this.process();
  }

  process() {
    this.primary();

    this.string('name');
    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });

    this.number('dialing_code');
    this.string('mobile');

    this.boolean('active', true);
    this.boolean('allow_broadcast', true);

    this.json('custom_attributes');

    this.json('attributes');
    this.whoColumns();
  }
}
