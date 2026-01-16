import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateQuickReplyTable1739513568340 extends MigrationUtility {
  constructor() {
    super('bz_quick_replies');
    this.process();
  }

  process() {
    this.primary();

    this.string('name');
    this.foreign({ foreignTable: 'bz_business_details', name: 'business_id' });

    this.string('shortcut');

    this.string('message', { width: 4096 });
    this.json('document');

    this.boolean('active', true);

    this.json('attributes');
    this.whoColumns();

    this.index(['business_id', 'shortcut'], 'bz_quick_replies_business_shortcut_index');
  }
}
