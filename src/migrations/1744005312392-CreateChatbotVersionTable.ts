import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateChatbotVersionTable1744005312392 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_versions');
    this.process();
  }

  process() {
    this.primary();

    this.string('name');

    this.foreign({ name: 'chatbot_id', foreignTable: 'bz_chatbot_details' });
    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });

    this.dateTime('published_at');
    this.json('raw_react_flow');

    this.json('attributes');
    this.whoColumns();
  }
}
