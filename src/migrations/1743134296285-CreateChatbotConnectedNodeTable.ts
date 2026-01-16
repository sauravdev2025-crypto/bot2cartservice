import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateChatbotConnectedNodeTable1743134296285 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_connected_nodes');
    this.process();
  }

  process() {
    this.primary();

    this.string('identifier');

    this.foreign({ foreignTable: 'bz_business_details', name: 'business_id' });
    this.foreign({ foreignTable: 'bz_chatbot_details', name: 'chatbot_id' });
    this.foreign({ foreignTable: 'utl_chatbot_nodes', name: 'node_id' });

    this.json('payload');

    this.json('attributes');
    this.whoColumns();
  }
}
