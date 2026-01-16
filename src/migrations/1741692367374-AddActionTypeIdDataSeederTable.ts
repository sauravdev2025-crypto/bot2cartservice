import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddActionTypeIdDataSeederTable1741692367374 extends SeederUtility {
  constructor() {
    super('sys_lookup_values');
    this.process();
  }

  process() {
    this.addLookupValues();
  }

  addLookupValues() {
    const records = [
      {
        id: 1122,
        name: 'Send Template Message',
        value: 'SEND_TEMPLATE_MESSAGE',
        description: 'send template message',
        lookup_type_id: 203,
      },
      {
        id: 1123,
        name: 'Send Document',
        value: 'SEND_DOCUMENT',
        description: 'send Document',
        lookup_type_id: 203,
      },
      {
        id: 1124,
        name: 'Send Image',
        value: 'SEND_IMAGE',
        description: 'send Image',
        lookup_type_id: 203,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
