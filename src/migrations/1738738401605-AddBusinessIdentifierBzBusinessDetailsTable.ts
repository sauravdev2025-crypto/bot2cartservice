import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddBusinessIdentifierBzBusinessDetailsTable1738738401605 extends MigrationUtility {
  constructor() {
    super('bz_business_details');
    this.process();
  }

  process() {
    this.string('internal_id');

    this.string('internal_access_token', { width: 1024 });
    this.string('internal_number');
  }
}
