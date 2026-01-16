import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateExternalApiLogTable1739942480707 extends MigrationUtility {
  constructor() {
    super('external_api_logs');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });
    this.foreign({ name: 'api_account_id', foreignTable: 'bz_api_accounts' });

    this.boolean('is_incoming');

    this.json('request');
    this.json('response');

    this.boolean('is_success', true);

    this.json('attributes');
    this.whoColumns();
  }
}
