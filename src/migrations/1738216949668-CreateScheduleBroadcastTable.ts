import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateScheduleBroadcastTable1738216949668 extends MigrationUtility {
  constructor() {
    super('bz_schedule_broadcast');
    this.process();
  }

  process() {
    this.primary();

    this.string('name');
    this.string('description', { width: 1024 });

    this.foreign({ foreignTable: 'bz_business_details', name: 'business_id' });
    this.foreign({ foreignTable: 'bz_communication_whatsapp_templates', name: 'template_id' });

    this.string('csv');

    this.dateTime('scheduled_at');

    this.dateTime('initiated_at');
    this.dateTime('completed_at');

    this.json('attributes');
    this.whoColumns();
  }
}
