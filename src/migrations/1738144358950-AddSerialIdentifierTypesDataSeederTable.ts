import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddSerialIdentifierTypesDataSeederTable1738144358950 extends SeederUtility {
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
        id: 4,
        name: 'Serial Identifier',
        description: 'Serial Identifier Column',
      },
      'sys_lookup_types'
    );
  }

  addLookupValues() {
    const records = [
      {
        id: 30,
        name: 'Templates',
        value: 'TEMP',
        description: 'This will be used for the template identifiers',
        lookup_type_id: 4,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
