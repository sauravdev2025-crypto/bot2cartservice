import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddLastLoginAtColumnSysUsersTable1737539505973 extends MigrationUtility {
  constructor() {
    super('sys_users');
    this.process();
  }

  process() {
    this.dateTime('last_login_at');
    this.dateTime('last_activity_at');
    this.dateTime('password_reset_at');

    this.string('auth_key');

    this.dateTime('password_expires_at');
    this.number('password_timeout_period');
  }
}
