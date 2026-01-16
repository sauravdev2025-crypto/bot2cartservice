import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, SqlService } from '@servicelabsco/nestjs-utility-services';
import { IsNull, Not } from 'typeorm';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { BusinessEntity } from '../entities/business.entity';

@Injectable()
export class SyncBusinessQualityHealthJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly sqlService: SqlService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService
  ) {
    super('4f929754bfde3c5a73a81834d993336b');
  }

  async handle(): Promise<void> {
    const businesses = await BusinessEntity.find({
      where: { active: true, internal_access_token: Not(IsNull()), internal_number: Not(IsNull()), internal_id: Not(IsNull()) },
    });

    for (const business of businesses) {
      await this.businessMetaIntegrationService.syncBusinessInfo(business?.id);
    }
  }
}
