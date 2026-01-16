import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateBzBusinessDetailsTable1681369386555 extends MigrationUtility {
  constructor() {
    super('bz_business_details');
    this.process();
  }

  process() {
    this.primary();

    this.string('name');
    this.foreign({ name: 'owner_id', foreignTable: 'sys_users' });
    this.number('identifier');
    this.boolean('active');
    this.number('meta_server_id');

    this.json('attributes');
    this.whoColumns();
  }
}
