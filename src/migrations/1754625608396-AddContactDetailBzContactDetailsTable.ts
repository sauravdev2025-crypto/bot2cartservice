import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddContactDetailBzContactDetailsTable1754625608396 extends MigrationUtility {
  constructor() {
    super('bz_contact_details');
    this.process();
  }

  process() {
    this.foreign({ name: 'managed_by', foreignTable: 'bz_business_users' });
  }
}
