import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateSystemLanguageTable1737614845776 extends MigrationUtility {
  constructor() {
    super('sys_languages');
    this.process();
  }

  process() {
    this.primary();

    this.string('name');
    this.string('code', { length: '10' }); // en. eu

    this.json('attributes');
    this.whoColumns();
  }
}
