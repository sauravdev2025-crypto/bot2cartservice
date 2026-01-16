import { SeederUtility } from '@servicelabsco/nestjs-utility-services';

export class AddChatbotActionTypeIdDataSeederDataSeederTable1742885528318 extends SeederUtility {
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
        id: 1125,
        name: 'Chatbot',
        value: 'CHATBOT',
        description: 'Trigger Chatbot',
        lookup_type_id: 203,
      },
    ];

    for (const record of records) {
      this.addRecord(record);
    }
  }
}
