import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddTeminboxStatusTypeDataSeederTable1745552430840 extends SeederUtility {
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
        id: 1111,
        name: 'Team Inbox Chat Status Type',
        description: 'Team Inbox Chat Status Type',
      },
      'sys_lookup_types'
    );
  }

  addLookupValues() {
    const records = [
      {
        id: 2025,
        name: 'Open',
        value: 'Open',
        description: 'Open',
        lookup_type_id: 1111,
      },
      {
        id: 2026,
        name: 'Pending',
        value: 'Pending',
        description: 'Pending',
        lookup_type_id: 1111,
      },
      {
        id: 2027,
        name: 'Solved',
        value: 'Solved',
        description: 'Solved',
        lookup_type_id: 1111,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
