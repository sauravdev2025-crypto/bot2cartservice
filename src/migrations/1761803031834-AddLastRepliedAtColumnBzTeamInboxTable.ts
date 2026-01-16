import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddLastRepliedAtColumnBzTeamInboxTable1761803031834 extends MigrationUtility {
  constructor() {
    super('bz_team_inbox');
    this.process();
  }

  process() {
    this.dateTime('last_replied_at');
  }
}
