import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddWaIdBzContactDetailsTable1738739719629 extends MigrationUtility {
  constructor() {
    super('bz_contact_details');
    this.process();
  }

  process() {
    this.string('wa_id');

    this.string('display_name');
    this.dateTime('validated_at');

    this.boolean('is_system_generated', false);
  }
}
