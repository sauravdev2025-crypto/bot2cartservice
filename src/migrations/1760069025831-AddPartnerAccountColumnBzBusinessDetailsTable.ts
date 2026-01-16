import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddPartnerAccountColumnBzBusinessDetailsTable1760069025831 extends MigrationUtility {
  constructor() {
    super('bz_business_details');
    this.process();
  }

  process() {
    this.foreign({ name: 'parent_id', foreignTable: 'bz_business_details' });
    this.boolean('is_partner_account', false);
  }
}
