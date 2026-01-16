import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ListingService } from '@servicelabsco/slabs-access-manager';
import { ProcessWhatsappTemplateList } from '../../business/libraries/process.whatsapp.template.list';
import { FacebookInternalMessageService } from '../../business/services/facebook.internal.message.service';
import { ExternalGetTemplatesListFilterDto } from '../dtos/external.get.templates.list.filter.dto';
import { ExternalAccessService } from '../services/external.access.service';
import { ExternalTransformerService } from '../services/external.transformer.service';
import { WhatsappTemplateTransformerListConstant } from '../transformer_constant/whatsapp.template.transformer.list.constant';
import { ProcessCommunicationTemplate } from '../../business/libraries/process.communication.template';
import { FacebookInternalService } from '../../business/services/facebook.internal.service';
import { WhatsappTemplateDto } from '../../business/dtos/whatsapp.template.dto';
import { ExternalSetTemplateDto } from '../dtos/external.set.template.dto';
import { FacebookInternalTemplateService } from '../../business/services/facebook.internal.template.service';

/**
 * create controller for ExternalApiLog
 * @export
 * @class ExternalApiLogController
 */
@Controller('v1/template')
export class ExternalApiTemplateController {
  constructor(
    protected readonly externalAccessService: ExternalAccessService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly facebookInternalTemplateService: FacebookInternalTemplateService,
    protected readonly listing_service: ListingService,
    protected readonly externalTransformerService: ExternalTransformerService,
    protected readonly facebookInternalService: FacebookInternalService
  ) {}

  @Get()
  @HttpCode(HttpStatus.ACCEPTED)
  @Get()
  async getAllTemplates(@Query() query: ExternalGetTemplatesListFilterDto) {
    const business = await this.externalAccessService.validateAccess();

    const template = await new ProcessWhatsappTemplateList(business, this.listing_service).process(query);
    return this.externalTransformerService.getListTransformedData(template, WhatsappTemplateTransformerListConstant);
  }

  // @Post()
  // @HttpCode(HttpStatus.ACCEPTED)
  // @Post()
  // async setTemplate(@Body() _body: ExternalSetTemplateDto) {
  //   const business = await this.externalAccessService.validateAccess();
  //   const language = await this.facebookInternalTemplateService.getLanguage(_body?.template_config?.category);

  //   const payload: WhatsappTemplateDto = {
  //     raw_json: _body?.template_config,
  //     category_id: this.facebookInternalTemplateService.getCategoryIdFromConfig(_body?.template_config?.category),
  //     language_id: language?.id,
  //     name: _body?.template_config?.name,
  //     header_media_detail: {},
  //   };
  //   return new ProcessCommunicationTemplate(business, this.facebookInternalService).create(payload);
  // }
}
