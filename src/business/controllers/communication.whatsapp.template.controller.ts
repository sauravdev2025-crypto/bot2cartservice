import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AccessService, Auth, OperationException, SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, DbFindOptionsDto, ListingService } from '@servicelabsco/slabs-access-manager';
import { ProcessDbFind } from '../../utility/libraries/process.db.find';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { CommunicationWhatsappTemplateListFilterDto } from '../dtos/communication.whatsapp.template.list.filter.dto';
import { WhatsappTemplateDto } from '../dtos/whatsapp.template.dto';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { WhatsappTemplateStatusEnum } from '../enums/whatsapp.template.status.enum';
import { ImportBusinessTemplateJob } from '../jobs/import.business.template.job';
import { ProcessCommunicationTemplate } from '../libraries/process.communication.template';
import { ProcessWhatsappTemplateList } from '../libraries/process.whatsapp.template.list';
import { BusinessAccessService } from '../services/business.access.service';
import { FacebookInternalService } from '../services/facebook.internal.service';
import { FacebookInternalTemplateService } from '../services/facebook.internal.template.service';

/**
 * create controller for WhatsappTemplate
 * @export
 * @class WhatsappTemplateController
 */
@Controller('api/b/communication-whatsapp-templates')
export class CommunicationWhatsappTemplateController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService,
    private readonly importBusinessTemplateJob: ImportBusinessTemplateJob,
    protected readonly accessService: AccessService,
    private readonly businessMetaIntegrationService: BusinessMetaIntegrationService,
    private readonly facebookInternalTemplateService: FacebookInternalTemplateService,
    private readonly facebookInternalService: FacebookInternalService
  ) {}

  @Post('search')
  async search(@Body() _body: CommunicationWhatsappTemplateListFilterDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessWhatsappTemplateList(business, this.listingService).process(_body);
  }

  @Get('business-template')
  async getBusinessTemplates() {
    const business = await this.businessAccessService.validateAccess();
    const businessTemplate = await this.facebookInternalTemplateService.getApprovedBusinessTemplate(business.id);

    const existingTemplates = await CommunicationWhatsappTemplateEntity.find({
      where: { business_id: business.id, status_id: WhatsappTemplateStatusEnum.APPROVED },
    });

    const existingIdentifier = existingTemplates?.map((tmp) => tmp.identifier);
    const filteredData = businessTemplate?.filter((data) => !existingIdentifier.includes(data?.name));

    return filteredData;
  }

  @Post('import-template')
  async importTemplate(@Body() body: any) {
    const business = await this.businessAccessService.validateAccess();
    await this.importBusinessTemplateJob.dispatch({ ids: body?.ids, business_id: business.id });
    return { success: true };
  }

  @Post('find')
  async find(@Body() _body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_communication_whatsapp_templates a',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id} and a.status_id = ${WhatsappTemplateStatusEnum.APPROVED}`,
      searchCompareKeys: ['a.name', 'a.identifier'],
      columns: ['a.name', 'a.identifier', 'a.csv_url', 'a.id', 'jsonb(a.sample_contents) sample_contents'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ..._body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }
  @Post('find-language')
  async findLanguage(@Body() _body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'sys_languages a',
      primaryCondition: `a.deleted_at is null`,
      searchCompareKeys: ['a.name', 'a.code'],
      columns: ['a.name', 'a.code', 'a.id'],
      order: `a.id asc`,
      idsCompareKey: 'a.id',
      ..._body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Get(':id')
  async show(@Param() _params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    return CommunicationWhatsappTemplateEntity.findOne({
      where: { id: _params.id, business_id: business.id },
      relations: ['language', 'category', 'status'],
    });
  }

  @Post()
  async create(@Body() _body: WhatsappTemplateDto) {
    const { business } = await this.nestedValidation();
    return new ProcessCommunicationTemplate(business, this.facebookInternalService).create(_body);
  }

  @Post('upload-to-facebook')
  async uploadMediaToFaceBookServer(@Body() body: any) {
    const { business } = await this.nestedValidation();

    const mediaId = await this.businessMetaIntegrationService.uploadInternalFile(business.id, body?.url);
    if (!mediaId) throw new OperationException('Error Uploding your media to the facebook server');

    return mediaId;
  }

  @Delete(':id')
  async delete(@Param() _params: BusinessParamDto) {
    await this.nestedValidation();
    const deleteFromMeta = await this.facebookInternalTemplateService.deleteTemplate(_params?.id);

    if (deleteFromMeta?.data?.error) {
      throw new OperationException(deleteFromMeta?.data?.error?.message);
    }

    const template = await CommunicationWhatsappTemplateEntity.first(_params?.id);
    return template.softDelete();
  }

  async nestedValidation() {
    const business = await this.businessAccessService.validateAccess(true);
    const user = Auth.user();

    return { business, user };
  }
}
