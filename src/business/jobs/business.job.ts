import { Injectable } from '@nestjs/common';
import { CacheService, CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { BusinessEntity } from '../entities/business.entity';

@Injectable()
export class BusinessJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService,
    protected readonly cacheService: CacheService
  ) {
    super('e4404373285ba072d374bc17008b03f1');
  }
  async handle(evt: DatabaseEventDto<BusinessEntity>) {
    await this.resetCache(evt);

    await this.subScribeBusinessWebhook(evt);
    await this.registerBusinessMobile(evt);

    return evt.entity;
  }

  async resetCache(evt: DatabaseEventDto<BusinessEntity>) {
    const key = `business.${evt.entity.id}.details`;
    return this.cacheService.set(key, null);
  }

  async subScribeBusinessWebhook(evt: DatabaseEventDto<BusinessEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['internal_access_token'])) return;

    if (!evt.entity.internal_id) return;
    await this.businessMetaIntegrationService.subscribeApp(evt.entity.internal_id, evt.entity.id);
  }

  async registerBusinessMobile(evt: DatabaseEventDto<BusinessEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['internal_access_token'])) return;

    if (!evt.entity.internal_number) return;
    return this.businessMetaIntegrationService.syncBusinessInfo(evt.entity.id);
  }
}
