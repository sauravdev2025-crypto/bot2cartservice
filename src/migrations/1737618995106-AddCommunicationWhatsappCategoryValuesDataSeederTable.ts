import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddCommunicationWhatsappCategoryValuesDataSeederTable1737618995106 extends SeederUtility {
  constructor() {
    super('sys_lookup_values');
    this.process();
  }

  process() {
    this.addLookupType();
    this.addLookupValues();
  }

  addLookupType() {
    this.addRecord(
      {
        id: 201,
        name: 'Communication Category Types',
        description: 'Communication Category Types',
      },
      'sys_lookup_types'
    );
  }

  addLookupValues() {
    const records = [
      {
        id: 200,
        name: 'Marketing',
        value: 'marketing',
        description: 'Marketing',
        lookup_type_id: 201,
      },
      {
        id: 201,
        name: 'Authentication',
        value: 'authentication',
        description: 'authentication',
        lookup_type_id: 201,
      },
      {
        id: 202,
        name: 'Utility',
        value: 'utility',
        description: 'utility',
        lookup_type_id: 201,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
