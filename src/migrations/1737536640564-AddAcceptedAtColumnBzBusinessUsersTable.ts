import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddAcceptedAtColumnBzBusinessUsersTable1737536640564 extends MigrationUtility {
  constructor() {
    super('bz_business_users');
    this.process();
  }

  process() {
    this.dateTime('accepted_at');
    this.boolean('mfa_required', false);
  }
}
