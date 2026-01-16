import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateUtlUserActivitiesTable1737532661419 extends MigrationUtility {
  constructor() {
    super('utl_user_activities');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ name: 'user_id', foreignTable: 'sys_users' });
    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });

    this.string('activity');
    this.string('ip');

    this.json('user_agent');

    this.dateTime('activity_at');

    this.string('session_identifier');

    this.json('attributes');
    this.whoColumns();
  }
}
