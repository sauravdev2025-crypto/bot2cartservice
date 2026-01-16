import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import {
  AccessException,
  Auth,
  CommentService,
  DocumentService,
  OperationException,
  SqlService,
  StringSearchDto,
} from '@servicelabsco/nestjs-utility-services';
import {
  BusinessParamDto,
  BusinessPreferenceService,
  BusinessUserEntity,
  CommonListFilterDto,
  DbFindOptionsDto,
  ListingService,
  ProcessDbFind,
} from '@servicelabsco/slabs-access-manager';
import { Response } from 'express';
import SourceHash from '../../config/source.hash';
import { LocalCommentJob } from '../../utility/jobs/local.comment.job';
import { CommentDocumentController } from '../../utility/libraries/comment.document.controller';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { SystemRolesConstants } from '../constants/system.roles.constants';
import { AddAssigneePayloadDto } from '../dtos/add.assignee.payload.dto';
import { SendTeamInboxMessagePayloadDto, SendTeamInboxSimpleMessagePayloadDto } from '../dtos/send.team.inbox.message.payload.dto';
import { TeamInboxListFilterDto } from '../dtos/team.inbox.list.filter.dto';
import { TeamInboxUpdateStatusDto } from '../dtos/team.inbox.update.status.dto';
import { ChatbotDetailEntity } from '../entities/chatbot.detail.entity';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { ProcessSendTeamInboxMessage } from '../libraries/process.send.team.inbox.message';
import { ProcessSetChatbotFlow } from '../libraries/process.set.chatbot.flow';
import { ProcessTeamInboxList } from '../libraries/process.team.inbox.list';
import { ProcessTeamInboxMessageList } from '../libraries/process.team.inbox.message.list';
import { BusinessAccessService } from '../services/business.access.service';
import { BusinessUserService } from '../services/business.user.service';
import { ContactService } from '../services/contact.service';
import { FacebookInternalMessageService } from '../services/facebook.internal.message.service';
import { TeamInboxService } from '../services/team.inbox.service';
import { MarkAsReadJob } from '../jobs/mark.as.read.job';

/**
 * create controller for TeamInbox
 * @export
 * @class TeamInboxController
 */
@Controller('api/b/team-inbox')
export class TeamInboxController extends CommentDocumentController {
  constructor(
    protected readonly documentService: DocumentService,
    protected readonly commentService: CommentService,
    protected readonly localCommentJob: LocalCommentJob,
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService,
    private readonly teamInboxService: TeamInboxService,
    private readonly facebookInternalMessageService: FacebookInternalMessageService,
    private readonly businessMetaIntegrationService: BusinessMetaIntegrationService,
    protected readonly businessUserService: BusinessUserService,
    protected readonly contactService: ContactService,
    protected readonly businessPreferenceService: BusinessPreferenceService,
    protected readonly markAsReadJob: MarkAsReadJob
  ) {
    super();
    this.sourceType = SourceHash.TeamInbox;
    this.parentValidator = this.nestedValidation;
  }

  @Post('search')
  async search(@Body() body: TeamInboxListFilterDto) {
    const business = await this.businessAccessService.validateAccess();

    const filters = this.teamInboxService.getSanitizedFilter(body);
    if (!body.assign_me) return new ProcessTeamInboxList(business, this.listingService, this.businessUserService).process(filters);

    const businessUser = await BusinessUserEntity.findOne({ where: { business_id: business.id, user_id: Auth.user().id } });
    return new ProcessTeamInboxList(business, this.listingService, this.businessUserService).process({ ...filters, assignee_ids: [businessUser.id] });
  }

  @Post(':id/messages')
  async messages(@Body() body: CommonListFilterDto, @Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    const message = await TeamInboxEntity.first(params.id, { relations: ['contact'] });
    if (!message) throw new OperationException('invalid request');

    return new ProcessTeamInboxMessageList(business, this.listingService).process({ ...body, mobile: message.contact.mobile });
  }

  @Post(':id/preview-chat')
  async numberMessages(@Body() body: CommonListFilterDto, @Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const contact = await ContactEntity.findOne({ where: { business_id: business.id, wa_id: String(params.id) } });
    return new ProcessTeamInboxMessageList(business, this.listingService).process({ ...body, mobile: contact.mobile });
  }

  @Get(':id/mobile')
  async prevDetail(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    const contact = await ContactEntity.findOne({ where: { wa_id: String(params.id), business_id: business.id } });
    if (!contact) throw new OperationException('invalid request');

    return TeamInboxEntity.findOne({
      where: { contact_id: contact.id, business_id: business.id },
      relations: ['status', 'contact', 'assignee.user'],
    });
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_team_inbox a',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id}`,
      searchCompareKeys: ['a.name'],
      columns: ['a.*'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Post(':id/mark-as-read')
  async markMessageAsRead(@Param() param: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    await this.markAsReadJob.dispatch(param?.id);

    return {
      success: true,
    };
  }

  @Get(':id')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const data = await TeamInboxEntity.findOne({
      where: { id: params.id, business_id: business.id },
      relations: ['status', 'contact', 'assignee.user'],
    });

    const role = await this.businessUserService.getCurrentUserRole();
    if ([SystemRolesConstants.ADMIN, SystemRolesConstants.OWNER].includes(role?.name)) return data;

    const preference = await this.businessPreferenceService.getPreference(business.id, 'phone.masking.enabled', { enabled: false });
    if (!preference?.enabled) return data;

    const phone = data?.contact?.masked_phone || this.contactService.maskPhoneKeep2First3Last(data?.contact?.mobile);
    return { ...data, contact: { ...data?.contact, mobile: phone } };
  }

  @Post()
  async create(@Body() body: SendTeamInboxMessagePayloadDto) {
    const business = await this.businessAccessService.validateAccess(true);
    return new ProcessSendTeamInboxMessage(business, this.businessMetaIntegrationService, this.facebookInternalMessageService).send(body);
  }

  @Post(':id/send-message')
  async sendMessage(@Body() body: SendTeamInboxSimpleMessagePayloadDto, @Param() param: BusinessParamDto) {
    const validation = await this.businessAccessService.validateAccess(true);
    return this.teamInboxService.sendSimpleMessage(param.id, body);
  }

  @Post(':id/trigger-chatbot/:second_id')
  async triggerChatbot(@Param() param: BusinessParamDto) {
    const validation = await this.businessAccessService.validateAccess(true);

    const chatbot = await ChatbotDetailEntity.first(param.second_id);
    if (!chatbot) throw new OperationException('invalid chatbot');

    return new ProcessSetChatbotFlow().process(chatbot.version_id, param.id);
  }

  @Post(':id/add-assignee')
  async addAssignee(@Body() body: AddAssigneePayloadDto, @Param() param: BusinessParamDto) {
    const validation = await this.businessAccessService.validateAccess(true);

    const inbox = await TeamInboxEntity.findOne({ where: { business_id: validation?.id, id: param.id } });
    if (!inbox) throw new OperationException('Invalid team inbox');

    inbox.assignee_id = body.assignee_id;
    return inbox.save();
  }

  @Post(':id/update-status')
  async updateStatus(@Body() body: TeamInboxUpdateStatusDto, @Param() param: BusinessParamDto) {
    const validation = await this.businessAccessService.validateAccess(true);
    const inbox = await TeamInboxEntity.findOne({ where: { business_id: validation?.id, id: param.id } });

    if (!inbox) throw new OperationException('Invalid team inbox');

    inbox.status_id = body.status_id;
    return inbox.save();
  }

  @Get(':slug/get-document')
  async getImage(@Param() params: BusinessParamDto, @Res() res: Response) {
    const business = await this.businessAccessService.validateAccess();
    const fileResponse = await this.facebookInternalMessageService.getDocumentFromId(params?.slug, business.id);
    if (!fileResponse) throw new OperationException('Error Getting the document');

    res.setHeader('Content-Type', fileResponse.headers['content-type']);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="internal_file".${this.facebookInternalMessageService.getFileExtension(fileResponse.headers['content-type'])}"`
    );

    fileResponse.data.pipe(res);
  }

  async nestedValidation(id: number) {
    const business = await this.businessAccessService.validateAccess();
    const entity = await TeamInboxEntity.findOne({ where: { id, business_id: business.id } });
    if (!entity) throw new AccessException(`You don't have access to this expense record`);

    return { business, entity };
  }
}
