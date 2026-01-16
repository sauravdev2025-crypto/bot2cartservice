import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddedAuthConfigColumnBzCommunicationWhatsappTemplatesTable1745570677953 extends MigrationUtility {
  constructor() {
    super('bz_communication_whatsapp_templates');
    this.process();
  }

  process() {
    this.json('auth_config');
  }
}
