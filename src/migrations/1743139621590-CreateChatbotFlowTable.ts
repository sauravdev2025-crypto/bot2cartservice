import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateChatbotFlowTable1743139621590 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_flow');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ foreignTable: 'bz_business_details', name: 'business_id' });
    this.foreign({ foreignTable: 'bz_chatbot_details', name: 'chatbot_id' });

    this.dateTime('start_time');
    this.dateTime('end_time');

    this.boolean('active', true);

    this.json('variables');

    this.json('attributes');
    this.whoColumns();
  }
}
