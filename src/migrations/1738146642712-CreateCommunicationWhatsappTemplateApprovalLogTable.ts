import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateCommunicationWhatsappTemplateApprovalLogTable1738146642712 extends MigrationUtility {
  constructor() {
    super('bz_communication_whatsapp_template_approval_logs');
    this.process();
  }

  process() {
    this.primary();

    this.string('message_id');

    this.foreign({ name: 'template_id', foreignTable: 'bz_communication_whatsapp_templates' });

    this.boolean('is_approved', false);

    this.dateTime('initiated_at');

    this.json('request');
    this.json('response');

    this.json('webhook_response');
    this.dateTime('finalized_at');

    this.json('attributes');
    this.whoColumns();

    this.index(['message_id'], 'bz_communication_whatsapp_template_approval_logs_message_id_index');
  }
}
