import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddMobileRegisterColumnBzBusinessDetailsTable1740727977347 extends MigrationUtility {
  constructor() {
    super('bz_business_details');
    this.process();
  }

  process() {
    this.dateTime('phone_registered_at');
    this.json('last_health_status');
  }
}
