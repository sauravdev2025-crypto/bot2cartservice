import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddStatusIdBzBroadcastMessagesTable1758785224637 extends MigrationUtility {
  constructor() {
    super('bz_broadcast_messages');
    this.process();
  }

  process() {
    this.foreign({ name: 'status_id', foreignTable: 'sys_lookup_values' });
  }
}
