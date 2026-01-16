import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddActionTypeIdDataSeederTable1741586938025 extends SeederUtility {
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
        id: 203,
        name: 'Action Type',
        description: 'Action Type',
      },
      'sys_lookup_types'
    );
  }

  addLookupValues() {
    const records = [
      {
        id: 1120,
        name: 'Text',
        value: 'TEXT',
        description: 'send text message',
        lookup_type_id: 203,
      },
      {
        id: 1121,
        name: 'Assign To user',
        value: 'ASSIGN TO USER',
        description: 'assign to user',
        lookup_type_id: 203,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
