import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class BroadcastMessageDataSeederTable1758785009464 extends SeederUtility {
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
        id: 1020,
        name: 'Broadcast message status',
        description: 'Broadcast message status',
      },
      'sys_lookup_types'
    );
  }

  addLookupValues() {
    const records = [
      {
        id: 2050,
        name: 'Initiated',
        value: 'Initiated',
        description: 'Initiated',
        lookup_type_id: 1020,
      },
      {
        id: 2051,
        name: 'Sent',
        value: 'Sent',
        description: 'Sent',
        lookup_type_id: 1020,
      },
      {
        id: 2052,
        name: 'Error',
        value: 'Error',
        description: 'Error',
        lookup_type_id: 1020,
      },
      {
        id: 2053,
        name: 'Delivered',
        value: 'Delivered',
        description: 'Delivered',
        lookup_type_id: 1020,
      },
      {
        id: 2054,
        name: 'Read',
        value: 'Read',
        description: 'Read',
        lookup_type_id: 1020,
      },
      {
        id: 2055,
        name: 'UNKNOWN',
        value: 'Unknown',
        description: 'Unknown',
        lookup_type_id: 1020,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
