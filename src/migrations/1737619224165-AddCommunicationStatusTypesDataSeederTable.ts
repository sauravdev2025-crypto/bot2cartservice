import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddCommunicationStatusTypesDataSeederTable1737619224165 extends SeederUtility {
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
        id: 200,
        name: 'Communication Template Status Types',
        description: 'Communication Template Status Types',
      },
      'sys_lookup_types'
    );
  }

  addLookupValues() {
    const records = [
      {
        id: 100,
        name: 'Draft',
        value: 'Draft',
        description: 'Draft',
        lookup_type_id: 200,
      },
      {
        id: 101,
        name: 'Pending',
        value: 'Pending',
        description: 'Pending',
        lookup_type_id: 200,
      },
      {
        id: 102,
        name: 'Approved',
        value: 'Approved',
        description: 'Approved',
        lookup_type_id: 200,
      },
      {
        id: 103,
        name: 'Rejected',
        value: 'Rejected',
        description: 'Rejected',
        lookup_type_id: 200,
      },
      {
        id: 104,
        name: 'Deleted',
        value: 'Deleted',
        description: 'Deleted',
        lookup_type_id: 200,
      },
      {
        id: 105,
        name: 'Paused',
        value: 'Paused',
        description: 'Paused',
        lookup_type_id: 200,
      },
      {
        id: 106,
        name: 'Disabled',
        value: 'Disabled',
        description: 'Disabled',
        lookup_type_id: 200,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
