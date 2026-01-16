import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddRawTemplateJsonColumnBzCommunicationWhatsappTemplatesTable1738137108093 extends MigrationUtility {
  constructor() {
    super('bz_communication_whatsapp_templates');
    this.process();
  }

  process() {
    this.json('raw_template_json');
    this.string('csv_url');
  }
}
