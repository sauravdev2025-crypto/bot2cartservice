import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber, InsertEvent } from 'typeorm';
import { ContactEntity } from '../entities/contact.entity';
import { ContactJob } from '../jobs/contact.job';
import { ContactService } from '../services/contact.service';

@EventSubscriber()
export class ContactSubscriber extends CommonSubscriber<ContactEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ContactJob,
    protected readonly contactService: ContactService
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ContactEntity;
  }

  async beforeInsert(event: InsertEvent<ContactEntity>) {
    event.entity.masked_phone = this.contactService.maskPhoneKeep2First3Last(event.entity.mobile);
  }
}
