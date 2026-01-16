import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddIndexBzContactDetailsTable1757009101629 extends MigrationUtility {
  constructor() {
    super('bz_contact_details');
    this.process();
  }

  process() {
    this.index(['business_id', 'wa_id'], 'wa_id');
    this.index(['business_id', 'dialing_code', 'mobile'], 'mobile');
  }
}
