import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddLastActivityAtColumnBzTeamInboxTable1739430672385 extends MigrationUtility {
  constructor() {
    super('bz_team_inbox');
    this.process();
  }

  process() {
    this.dateTime('last_activity_at');
  }
}
