import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddManagerIdBzBusinessUsersTable1754638165418 extends MigrationUtility {
  constructor() {
    super('bz_business_users');
    this.process();
  }

  process() {
    this.foreign({ name: 'manager_id', foreignTable: 'bz_business_users' });
  }
}
