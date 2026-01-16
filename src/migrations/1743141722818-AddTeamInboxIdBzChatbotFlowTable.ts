import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddTeamInboxIdBzChatbotFlowTable1743141722818 extends MigrationUtility {
  constructor() {
    super('bz_chatbot_flow');
    this.process();
  }

  process() {
    this.foreign({ foreignTable: 'bz_team_inbox', name: 'team_inbox_id' });
  }
}
