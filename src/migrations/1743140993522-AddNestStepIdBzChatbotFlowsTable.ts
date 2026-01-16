import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddNestStepIdBzChatbotFlowsTable1743140993522 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_flow');
    this.process();
  }

  process() {
    this.foreign({ foreignTable: 'bz_chatbot_flow_steps', name: 'next_step_id' });
  }
}
