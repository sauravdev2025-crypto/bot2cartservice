import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddTypeIdDataSeederTable1737624715941 extends SeederUtility {
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
        id: 3,
        name: 'System Script Types',
        description: 'System Script Types',
      },
      'sys_lookup_types'
    );
  }

  addLookupValues() {
    const records = [
      {
        id: 20,
        name: 'Whatsapp Template',
        value: 'Whatsapp Template',
        description: 'Whatsapp Template',
        lookup_type_id: 3,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
