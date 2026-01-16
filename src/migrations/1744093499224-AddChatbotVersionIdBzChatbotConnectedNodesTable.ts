import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddChatbotVersionIdBzChatbotConnectedNodesTable1744093499224 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_connected_nodes');
    this.process();
  }

  process() {
    this.foreign({ foreignTable: 'bz_chatbot_versions', name: 'chatbot_version_id' });
  }
}
