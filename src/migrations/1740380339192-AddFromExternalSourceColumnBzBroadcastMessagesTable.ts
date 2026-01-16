import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddFromExternalSourceColumnBzBroadcastMessagesTable1740380339192 extends MigrationUtility {
  constructor() {
    super('bz_broadcast_messages');
    this.process();
  }

  process() {
    this.boolean('from_external_source', false);
  }
}
