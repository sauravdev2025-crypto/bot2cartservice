import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  AccessService,
  Hash,
  PlatformUtility,
  PropertyService,
  QueueService,
  RefreshPropertyCacheJob,
  SqsService,
  SyncAllCodeJob,
} from '@servicelabsco/nestjs-utility-services';
import { FileUploadService, LambdaService } from '@servicelabsco/slabs-access-manager';
import { AppService } from './app.service';

import { MessageGateway } from './business/services/message.gateway';
import { WebhookService } from './business/services/webhook.service';
import { BusinessParamDto } from './common/dtos/business.param.dto';

@Controller()
export class AppController {
  constructor(
    protected readonly appService: AppService,
    protected readonly queueService: QueueService,
    protected readonly refreshPropertyCacheJob: RefreshPropertyCacheJob,
    protected readonly fileUploadService: FileUploadService,
    protected readonly syncAllCodeJob: SyncAllCodeJob,
    protected readonly accessService: AccessService,
    protected readonly lambdaService: LambdaService,
    protected readonly sqsService: SqsService,
    protected readonly webhookService: WebhookService,
    protected readonly propertyService: PropertyService,
    protected readonly messageGateway: MessageGateway
  ) {}

  @Get()
  async getHello() {
    return {
      message: 'Hello From the other side',
    };
  }

  @Get('health')
  health() {
    return { health: true };
  }

  @Get('internal/test')
  check() {
    return;
  }

  @Get('failed-jobs')
  async getFailedJobs() {
    return this.queueService.getFailedJobs(0, 100);
  }

  @Get('clean-jobs')
  async cleanQueue() {
    const isProduction = PlatformUtility.isProductionEnvironment();
    if (isProduction) return {};

    const queue = this.queueService.getQueueInstance();

    queue.clean(0, 0, 'delayed');
    queue.clean(0, 0, 'wait');
    queue.clean(0, 0, 'active');
    queue.clean(0, 0, 'completed');
    queue.clean(0, 0, 'failed');
  }

  @Get('refresh-cache')
  async refreshCache() {
    await this.refreshPropertyCacheJob.delayedDispatch(1);
  }

  @Get('queue/:id')
  async getQueueDetails(@Param('id') id: string) {
    return this.queueService.getJobDetails(id);
  }

  @Get('queue')
  async getQueue() {
    const runningStats = await this.queueService.getStats();
    const jobStats = await this.queueService.getQueueStats();

    return { runningStats, jobStats };
  }

  @Get('retrigger/:slug')
  async retriggerJob(@Param() params: BusinessParamDto) {
    const isProduction = PlatformUtility.isProductionEnvironment();
    if (isProduction) return {};

    const job = await this.queueService.getJobDetails(params.slug);
    const data = job.data;

    return this.queueService.addJob(data.job, data.payload);
  }

  @Get('sync-code')
  async syncCode() {
    return this.syncAllCodeJob.dispatch();
  }

  @Post('sets')
  async checkMedia(@Body() body: any) {
    // return Hash.hash('123456');
    // return this.pollWhatsappIncomingMessageJob.handle();
  }
}
