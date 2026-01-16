import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddMaskedNumberBzContactDetailsTable1758439448751 extends MigrationUtility {
  constructor() {
    super('bz_contact_details');
    this.process();
  }

  process() {
    this.string('masked_phone');
  }
}
