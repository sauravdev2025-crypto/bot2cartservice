import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddIsLogColumnBzBroadcastMessagesTable1754977155766 extends MigrationUtility {
  constructor() {
    super('bz_broadcast_messages');
    this.process();
  }

  process() {
    this.boolean('is_log', false);
  }
}
