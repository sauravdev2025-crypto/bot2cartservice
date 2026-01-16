import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddExpiresAtBzChatbotFlowTable1743495444402 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_flow');
    this.process();
  }

  process() {
    this.dateTime('node_expires_at');
  }
}
