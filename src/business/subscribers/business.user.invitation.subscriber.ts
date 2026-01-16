import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { BusinessUserInvitationEntity } from '../entities/business.user.invitation.entity';
import { BusinessUserInvitationJob } from '../jobs/business.user.invitation.job';

@EventSubscriber()
export class BusinessUserInvitationSubscriber extends CommonSubscriber<BusinessUserInvitationEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: BusinessUserInvitationJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return BusinessUserInvitationEntity;
  }
}
