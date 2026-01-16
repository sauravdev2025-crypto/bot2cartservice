import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateChatbotNodesTable1743057373728 extends MigrationUtility {
  constructor() {
    super('utl_chatbot_nodes');
    this.process();
  }

  process() {
    this.primary();

    this.string('identifier');

    this.string('title', { length: '50' });
    this.string('sub_title', { length: '300' });

    this.string('icon', { length: '60' });
    this.string('description', { length: '1000' });

    this.json('style');
    this.string('type');

    this.json('attributes');
    this.whoColumns();
  }
}
