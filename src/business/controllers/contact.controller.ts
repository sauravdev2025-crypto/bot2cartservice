import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OperationException, SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, DbFindOptionsDto, ListingService } from '@servicelabsco/slabs-access-manager';
import { IsNull, Not } from 'typeorm';
import { ProcessDbFind } from '../../utility/libraries/process.db.find';
import { SystemRolesConstants } from '../constants/system.roles.constants';
import { AddContactDto } from '../dtos/add.contact.dto';
import { AddEnableBotModePayloadDto } from '../dtos/add.enable.bot.mode.payload.dto';
import { ContactListFilterDto } from '../dtos/contact.list.filter.dto';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { ProcessContactList } from '../libraries/process.contact.list';
import { BusinessAccessService } from '../services/business.access.service';
import { BusinessUserService } from '../services/business.user.service';
import { ContactService } from '../services/contact.service';

/**
 * create controller for Contact
 * @export
 * @class ContactController
 */
@Controller('api/b/contact')
export class ContactController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly businessUserService: BusinessUserService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService,
    private readonly contactService: ContactService
  ) {}

  @Post('search')
  async search(@Body() body: ContactListFilterDto) {
    const business = await this.businessAccessService.validateAccess();
    const data = await new ProcessContactList(business, this.listingService).process(body);

    const role = await this.businessUserService.getCurrentUserRole();
    if ([SystemRolesConstants.ADMIN, SystemRolesConstants.OWNER].includes(role?.name)) return data;

    return this.contactService.maskList(business.id, data);
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_contact_details a',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id}`,
      searchCompareKeys: ['a.name', 'a.wa_id', 'a.identifier'],
      columns: ['a.name', 'a.dialing_code', 'a.mobile', 'a.active', 'a.id', 'a.display_name', 'a.wa_id'],
      order: `a.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Post('find-contact-attributes')
  async findContactAttributes(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const contactAttributes = await ContactEntity.find({ where: { business_id: business.id, active: true, custom_attributes: Not(IsNull()) } });
    const attributes = Array.from(new Set(contactAttributes.flatMap((val) => [...val?.custom_attributes])));

    return attributes;
  }

  @Get(':id')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return ContactEntity.findOne({ where: { id: params.id, business_id: business.id } });
  }

  @Post(':id/enable-bot')
  async enableBot(@Body() body: AddEnableBotModePayloadDto, @Param() param: BusinessParamDto) {
    const validation = await this.businessAccessService.validateAccess(true);

    const contact = await ContactEntity.findOne({ where: { business_id: validation?.id, id: param.id } });
    if (!contact) throw new OperationException('No contact available');

    contact.is_assigned_to_bot = body.is_assigned_to_bot;

    return contact.save();
  }

  @Post()
  async create(@Body() body: AddContactDto) {
    const business = await this.businessAccessService.validateAccess();

    let contact = ContactEntity.create({ business_id: business.id });
    if (body?.id) contact = await ContactEntity.first(body.id);

    if (!body.id) {
      const find = await ContactEntity.findOne({ where: { business_id: business.id, dialing_code: body?.dialing_code, mobile: body?.mobile } });
      if (find) throw new OperationException('Duplicate Contact');
    }

    contact.dialing_code = body.dialing_code;
    contact.mobile = body.mobile;
    contact.identifier = body?.identifier;

    contact.display_name = body.name;
    if (!contact.name) contact.name = body.name;

    contact.custom_attributes = body.custom_attributes;
    contact.wa_id = `${body.dialing_code}${body.mobile}`;
    contact.managed_by = body?.managed_by;

    return contact.save();
  }

  @Delete(':id')
  async delete(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    const contact = await ContactEntity.findOne({ where: { business_id: business.id, id: params.id } });
    if (!contact) throw new OperationException('Invalid Contact');

    const inbox = await TeamInboxEntity.findOne({ where: { business_id: business.id, contact_id: params.id } });
    if (inbox) await inbox.softDelete();

    return contact.softDelete();
  }

  @Post(':id/activate')
  async activate(@Param() params: BusinessParamDto) {
    return this.handleContactStatus(true, params.id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param() params: BusinessParamDto) {
    return this.handleContactStatus(false, params.id);
  }

  async handleContactStatus(status: boolean, email_id: number) {
    const business = await this.businessAccessService.validateAccess();

    const r = await ContactEntity.findOne({
      where: { id: email_id, business_id: business.id },
    });

    if (!r) throw new NotFoundException();

    if (status === r.active) throw new OperationException(`Invalid Operation`);
    r.active = status;

    return r.save();
  }
}
