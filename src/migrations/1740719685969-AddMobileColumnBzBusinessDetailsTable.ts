import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddMobileColumnBzBusinessDetailsTable1740719685969 extends MigrationUtility {
  constructor() {
    super('bz_business_details');
    this.process();
  }

  process() {
    this.dateTime('verified_at');

    this.string('default_mobile');
    this.string('wa_display_name');
  }
}
