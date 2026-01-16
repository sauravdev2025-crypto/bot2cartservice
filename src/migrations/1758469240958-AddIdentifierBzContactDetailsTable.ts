import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddIdentifierBzContactDetailsTable1758469240958 extends MigrationUtility {
  constructor() {
    super('bz_contact_details');
    this.process();
  }

  process() {
    this.string('identifier');
    this.index(['business_id', 'identifier'], 'bz_contact_details_identifier_index');
  }
}
