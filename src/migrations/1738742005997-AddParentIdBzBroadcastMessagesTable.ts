import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddParentIdBzBroadcastMessagesTable1738742005997 extends MigrationUtility {
  constructor() {
    super('bz_broadcast_messages');
    this.process();
  }

  process() {
    this.boolean('is_replied', false);
    this.foreign({ name: 'parent_id', foreignTable: 'bz_broadcast_messages' });
  }
}
