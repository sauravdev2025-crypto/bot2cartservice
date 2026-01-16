import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddIndexBzBroadcastMessagesTable1757009275735 extends MigrationUtility {
  constructor() {
    super('bz_broadcast_messages');
    this.process();
  }

  process() {
    this.index(['business_id', 'mobile', 'dialing_code'], 'mobile');
    this.index(['message_id'], 'message_id');
  }
}
