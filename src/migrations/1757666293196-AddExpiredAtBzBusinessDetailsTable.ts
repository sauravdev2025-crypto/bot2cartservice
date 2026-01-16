import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddExpiredAtBzBusinessDetailsTable1757666293196 extends MigrationUtility {
  constructor() {
    super('bz_business_details');
    this.process();
  }

  process() {
    this.dateTime('expired_at');
  }
}
