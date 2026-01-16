import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AccessException, OperationException, SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { AddWebhookDto, BusinessParamDto, BusinessWebhookEntity, DbFindOptionsDto, WebhookLogEntity } from '@servicelabsco/slabs-access-manager';
import { In } from 'typeorm';
import { ProcessDbFind } from '../../utility/libraries/process.db.find';
import { BusinessAccessService } from '../services/business.access.service';

@Controller('api/b/communication-webhook')
export class CommunicationBusinessWebhookController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService
  ) {}

  @Get('list')
  async getWebhooks() {
    const business = await this.businessAccessService.validateAccess();
    return BusinessWebhookEntity.find({ where: { business_id: business.id } });
  }

  @Get('logs')
  async getLastLogs() {
    const business = await this.businessAccessService.validateAccess();

    const sql = `select a.id, a.url from bz_webhook_details a where a.business_id = ${business.id}`;
    const webhooks = await this.sqlService.sql(sql);
    const ids = webhooks?.map((val) => val?.id);

    return WebhookLogEntity.find({
      where: { webhook_id: In(ids) },
      take: 50,
      order: { created_at: 'DESC' },
      relations: ['event'],
    });
  }

  @Delete(':id')
  async delete(@Param() param: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return BusinessWebhookEntity.softDelete({ id: param?.id, business_id: business.id });
  }

  @Post('find-event')
  async find(@Body() body: StringSearchDto) {
    await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'utl_webhook_events a',
      primaryCondition: `a.deleted_at is null`,
      searchCompareKeys: ['a.name'],
      columns: ['a.*'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Get('detail')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return BusinessWebhookEntity.findOne({ where: { id: params.id, business_id: business.id } });
  }

  @Post()
  async create(@Body() body: AddWebhookDto) {
    const business = await this.businessAccessService.validateAccess();

    const otherWebhooks = await BusinessWebhookEntity.find({ where: { business_id: business.id } });

    // Check if any existing webhook has overlapping events
    const hasOverlap = otherWebhooks.some((webhook) => {
      const existingEvents = webhook.event_type || [];
      const newEvents = body.events || [];
      return existingEvents.some((event) => newEvents.includes(event));
    });

    if (hasOverlap) {
      throw new OperationException('Same events are already assigned to another webhook');
    }

    let wh = await BusinessWebhookEntity.create({ business_id: business.id, url: body.url });
    if (body.id) wh = await BusinessWebhookEntity.first(body?.id);

    const existingWebhook = await BusinessWebhookEntity.findOne({ where: { business_id: business.id, url: body.url } });
    if (existingWebhook) {
      throw new OperationException('This URL is already assigned to another webhook');
    }

    wh.active = true;
    wh.event_type = body.events;

    return wh.save();
  }

  @Post('activate')
  async activate() {
    return this.handleStatus(true);
  }

  @Post('deactivate')
  async deactivate() {
    return this.handleStatus(false);
  }

  async handleStatus(status: boolean) {
    const business = await this.businessAccessService.validateAccess();
    const r = await BusinessWebhookEntity.findOne({ where: { business_id: business.id } });

    if (r?.business_id !== business.id) throw new AccessException();
    if (status === r.active) throw new OperationException(`Invalid Operation`);

    r.active = status;
    return r.save();
  }
}
