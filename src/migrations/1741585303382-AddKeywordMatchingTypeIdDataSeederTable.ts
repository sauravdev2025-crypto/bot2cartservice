import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddKeywordMatchingTypeIdDataSeederTable1741585303382 extends SeederUtility {
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
        id: 202,
        name: 'Keyword Matching Type',
        description: 'Keyword Matching Type',
      },
      'sys_lookup_types'
    );
  }

  addLookupValues() {
    const records = [
      {
        id: 1110,
        name: 'FUZZY',
        value: 'FUZZY',
        description: 'FUZZY',
        lookup_type_id: 202,
      },
      {
        id: 1111,
        name: 'EXACT',
        value: 'EXACT',
        description: 'EXACT',
        lookup_type_id: 202,
      },
      {
        id: 1112,
        name: 'CONTAIN',
        value: 'CONTAIN',
        description: 'CONTAIN',
        lookup_type_id: 202,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
