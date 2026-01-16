import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddVersionIdBzChatbotDetailsTable1744005594042 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_details');
    this.process();
  }

  process() {
    this.foreign({ foreignTable: 'bz_chatbot_versions', name: 'version_id' });
  }
}
