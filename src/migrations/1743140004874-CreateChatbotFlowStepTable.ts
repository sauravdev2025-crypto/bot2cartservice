import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateChatbotFlowStepTable1743140004874 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_flow_steps');
    this.process();
  }

  process() {
    this.primary();

    this.foreign({ foreignTable: 'bz_chatbot_flow', name: 'flow_id' });

    this.dateTime('start_time');
    this.dateTime('end_time');

    this.foreign({ foreignTable: 'bz_chatbot_connected_nodes', name: 'node_id' });

    this.json('payload');

    this.json('attributes');
    this.whoColumns();
  }
}
