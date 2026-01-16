import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateBzBusinessTokensTable1737532427100 extends MigrationUtility {
  constructor() {
    super('bz_business_tokens');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });
    this.foreign({ name: 'user_id', foreignTable: 'sys_users' });

    this.number('token');

    this.dateTime('expired_at');
    this.dateTime('validated_at');

    this.json('attributes');
    this.whoColumns();
  }
}
