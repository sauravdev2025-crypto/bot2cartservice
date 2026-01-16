import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddRawJsonMessageIdBzCommunicationWhatsappTemplatesTable1759906202260 extends MigrationUtility {
  constructor() {
    super('bz_communication_whatsapp_templates');
    this.process();
  }

  process() {
    this.string('message_id');

    this.json('webhook_response');
    this.json('template_config');
  }
}
