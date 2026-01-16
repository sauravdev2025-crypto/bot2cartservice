import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateBroadcastMessageTable1738299620093 extends MigrationUtility {
  constructor() {
    super('bz_broadcast_messages');
    this.process();
  }

  process() {
    this.primary();
    this.source();

    this.foreign({ foreignTable: 'bz_business_details', name: 'business_id' });
    this.foreign({ foreignTable: 'bz_communication_whatsapp_templates', name: 'template_id' });

    this.dateTime('scheduled_at');

    this.dateTime('sent_at');
    this.dateTime('delivered_at');
    this.dateTime('read_at');

    this.boolean('is_error', false);
    this.boolean('active', true);

    this.number('dialing_code');
    this.string('mobile');

    this.json('payload');
    this.json('attributes');

    this.whoColumns();
  }
}
