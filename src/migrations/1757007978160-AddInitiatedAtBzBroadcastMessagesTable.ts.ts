import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddInitiatedAtBzBroadcastMessagesTable1757007978160 extends MigrationUtility {
  constructor() {
    super('bz_broadcast_messages');
    this.process();
  }

  process() {
    this.dateTime('initiated_at');
  }
}
