import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddUserReminderPreferenceBzBusinessSettingsTable1761634042027 extends MigrationUtility {
  constructor() {
    super('bz_business_settings');
    this.process();
  }

  process() {
    this.json('user_reminder_preference');
  }
}
