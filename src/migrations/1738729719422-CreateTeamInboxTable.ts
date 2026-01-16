import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateTeamInboxTable1738729719422 extends MigrationUtility {
  constructor() {
    super('bz_team_inbox');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });
    this.foreign({ name: 'contact_id', foreignTable: 'bz_contact_details' });

    this.foreign({ name: 'status_id', foreignTable: 'sys_lookup_values' });

    this.string('facebook_conversation_identifier');

    this.boolean('active', true);
    this.boolean('only_broadcast', true);

    this.boolean('is_favorite');
    this.boolean('is_blocked', false);

    this.dateTime('expired_at');

    this.json('attributes');
    this.whoColumns();
  }
}
