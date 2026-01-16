import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateChatbotDetailTable1742463231264 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_details');
    this.process();
  }

  process() {
    this.primary();

    this.string('name', { length: '100' });
    this.string('description', { length: '500' });

    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });

    this.boolean('active', true);

    this.json('raw_react_flow');

    this.json('attributes');
    this.whoColumns();
  }
}
