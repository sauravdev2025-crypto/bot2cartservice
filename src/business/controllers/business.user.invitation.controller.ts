import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OperationException, SqlService } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, ListingService } from '@servicelabsco/slabs-access-manager';
import { BusinessUserInvitationDto } from '../dtos/business.user.invitation.dto';
import { BusinessUserInvitationListFilterDto } from '../dtos/business.user.invitation.list.filter.dto';
import { BusinessUserInvitationEntity } from '../entities/business.user.invitation.entity';
import { ProcessBusinessUserInvitationList } from '../libraries/process.business.user.invitation.list';
import { BusinessAccessService } from '../services/business.access.service';

/**
 * create controller for BusinessUserInvitation
 * @export
 * @class BusinessUserInvitationController
 */
@Controller('api/b/invite-user')
export class BusinessUserInvitationController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly sqlService: SqlService,
    private readonly listingService: ListingService
  ) {}

  @Post('search')
  async search(@Body() body: BusinessUserInvitationListFilterDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessBusinessUserInvitationList(business, this.listingService).process(body);
  }

  @Get(':id')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    return BusinessUserInvitationEntity.findOne({ where: { id: params.id, business_id: business.id } });
  }

  @Post()
  async create(@Body() body: BusinessUserInvitationDto) {
    const business = await this.businessAccessService.validateAccess();

    let invitedUser = BusinessUserInvitationEntity.create({ business_id: business.id });
    if (body?.id) invitedUser = await BusinessUserInvitationEntity.first(body.id);

    invitedUser.email = body?.email?.toLowerCase();
    invitedUser.role_id = body.role_id;
    invitedUser.rejected_at = null;
    invitedUser.accepted_at = null;

    return invitedUser.save();
  }
  @Post(':id/re-invite')
  async reinvite(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const invitedUser = await BusinessUserInvitationEntity.first(params.id);

    invitedUser.rejected_at = null;
    invitedUser.accepted_at = null;
    invitedUser.attributes = {
      ...invitedUser.attributes,
      resend: (invitedUser.attributes?.resend || 0) + 1,
    };

    return invitedUser.save();
  }

  @Delete(':id')
  async delete(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const bui = await BusinessUserInvitationEntity.findOne({ where: { business_id: business.id, id: params.id } });

    if (!bui) throw new OperationException('Invalid bui');

    return bui.softDelete();
  }
}
