import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddChatbotVersionidBzChatbotFlowTable1744093252147 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_flow');
    this.process();
  }

  process() {
    this.foreign({ foreignTable: 'bz_chatbot_versions', name: 'chatbot_version_id' });
  }
}
