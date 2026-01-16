import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddMessageLimitTierBzBusinessDetailsTable1740740558523 extends MigrationUtility {
  constructor() {
    super('bz_business_details');
    this.process();
  }

  process() {
    this.number('total_message_limit');
    this.number('total_sent');

    this.json('quality_response');
  }
}
