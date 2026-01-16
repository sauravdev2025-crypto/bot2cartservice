import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddIndexBzTeamInboxTable1757009179315 extends MigrationUtility {
  constructor() {
    super('bz_team_inbox');
    this.process();
  }

  process() {
    this.index(['business_id', 'contact_id'], 'contact_id');
    this.index(['business_id', 'assignee_id'], 'assignee_id');
    this.index(['business_id', 'status_id'], 'status_id');
  }
}
