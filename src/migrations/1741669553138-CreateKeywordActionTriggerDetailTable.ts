import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateKeywordActionTriggerDetailTable1741669553138 extends MigrationUtility {
  constructor() {
    super('bz_keyword_action_trigger_details');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ foreignTable: 'bz_business_details', name: 'business_id' });
    this.foreign({ foreignTable: 'bz_keyword_action_details', name: 'keyword_action_id' });

    this.boolean('is_success');
    this.dateTime('initiated_at');

    this.json('attributes');
    this.whoColumns();
  }
}
