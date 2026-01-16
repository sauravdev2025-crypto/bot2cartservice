import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class CreateCommunicationWhatsappTemplateTable1737617018068 extends MigrationUtility {
  constructor() {
    super('bz_communication_whatsapp_templates');
    this.process();
  }

  process() {
    this.primary();

    this.string('identifier', { length: '250' });
    this.string('name', { length: '50' });

    this.json('attributes');

    this.foreign({ name: 'business_id', foreignTable: 'bz_business_details' });
    this.foreign({ name: 'language_id', foreignTable: 'sys_languages' });

    this.foreign({ name: 'category_id', foreignTable: 'sys_lookup_values' }); // Marketing, Utility
    this.foreign({ name: 'status_id', foreignTable: 'sys_lookup_values' }); // Approved, Rejected, Pending

    this.json('title');

    this.foreign({ name: 'body_id', foreignTable: 'sys_system_scripts' });
    this.foreign({ name: 'footer_id', foreignTable: 'sys_system_scripts' });

    this.json('button_configurations');
    this.json('sample_contents');

    this.whoColumns();

    this.index(['business_id', 'identifier'], 'bz_communication_templates_identifier_index');
  }
}
