import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddChatbotVersionIdBzChatbotConnectedEdgesTable1744093523012 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_connected_edges');
    this.process();
  }

  process() {
    this.foreign({ foreignTable: 'bz_chatbot_versions', name: 'chatbot_version_id' });
  }
}
