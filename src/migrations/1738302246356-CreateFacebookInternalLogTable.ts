import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateFacebookInternalLogTable1738302246356 extends MigrationUtility {
  constructor() {
    super('sys_facebook_internal_logs');
    this.process();
  }

  process() {
    this.primary();
    this.source();

    this.string('facebook_identifier');

    this.json('payload');
    this.json('response');

    this.json('webhook_response');
    this.boolean('is_incoming');

    this.json('attributes');
    this.whoColumns();
  }
}
