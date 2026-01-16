import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddAssigneeIdColumnBzTeamInboxTable1741061459733 extends MigrationUtility {
  constructor() {
    super('bz_team_inbox');
    this.process();
  }

  process() {
    this.foreign({ name: 'assignee_id', foreignTable: 'bz_business_users' });
  }
}
