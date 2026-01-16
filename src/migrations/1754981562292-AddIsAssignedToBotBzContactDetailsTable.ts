import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddIsAssignedToBotBzContactDetailsTable1754981562292 extends MigrationUtility {
  constructor() {
    super('bz_contact_details');
    this.process();
  }

  process() {
    this.boolean('is_assigned_to_bot', true);
  }
}
