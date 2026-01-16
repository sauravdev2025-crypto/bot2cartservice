import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateChatbotConnectedEdgesTable1743135395457 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_connected_edges');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ foreignTable: 'bz_chatbot_connected_nodes', name: 'node_id' });
    this.foreign({ foreignTable: 'bz_chatbot_connected_nodes', name: 'connected_node_id' });
    this.foreign({ foreignTable: 'bz_chatbot_details', name: 'chatbot_id' });

    this.string('edge_id');
    this.json('payload');

    this.json('attributes');
    this.whoColumns();
  }
}
