import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddFacebookIdentifiersBzBroadcastMessagesTable1738323958675 extends MigrationUtility {
  constructor() {
    super('bz_broadcast_messages');
    this.process();
  }

  process() {
    this.string('message_id');

    this.json('response');
    this.json('webhook_response');
  }
}
