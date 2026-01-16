import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { BusinessSettingDetailEntity } from '../entities/business.setting.detail.entity';
import { BusinessSettingDetailJob } from '../jobs/business.setting.detail.job';

@EventSubscriber()
export class BusinessSettingDetailSubscriber extends CommonSubscriber<BusinessSettingDetailEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: BusinessSettingDetailJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return BusinessSettingDetailEntity;
  }
}
