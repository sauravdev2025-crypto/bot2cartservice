import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateBusinessUserInvitationTable1740464299354 extends MigrationUtility {
  constructor() {
    super('bz_user_invitations');
    this.process();
  }

  process() {
    this.primary();

    this.string('email');
    this.foreign({ foreignTable: 'bz_business_details', name: 'business_id' });

    this.dateTime('accepted_at');
    this.dateTime('rejected_at');

    this.json('attributes');
    this.whoColumns();
  }
}
