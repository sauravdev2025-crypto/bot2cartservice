import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OperationException, SqlService, StringSearchDto } from '@servicelabsco/nestjs-utility-services';
import {
  BusinessParamDto,
  BusinessUserEntity,
  BusinessUserRoleEntity,
  DbFindOptionsDto,
  ListingService,
  ProcessDbFind,
} from '@servicelabsco/slabs-access-manager';
import { AddAssigneePayloadDto } from '../dtos/add.assignee.payload.dto';
import { BusinessUserListFilterDto } from '../dtos/business.user.list.filter.dto';
import { CommunicationBusinessUserEntity } from '../entities/communication.business.user.entity';
import { ProcessBusinessUserList } from '../libraries/process.business.user.list';
import { BusinessAccessService } from '../services/business.access.service';

@Controller('api/b/business-user')
export class BusinessUserController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly listingService: ListingService,
    private readonly sqlService: SqlService
  ) {}

  @Post('search')
  async search(@Body() body: BusinessUserListFilterDto) {
    const business = await this.businessAccessService.validateAccess();
    return new ProcessBusinessUserList(business, this.listingService).process(body);
  }

  @Post('find')
  async find(@Body() body: StringSearchDto) {
    const business = await this.businessAccessService.validateAccess();

    const config: DbFindOptionsDto = {
      tableName: 'bz_business_users a left join sys_users b on b.id = a.user_id',
      primaryCondition: `a.deleted_at is null and a.business_id = ${business.id}`,
      searchCompareKeys: ['b.name'],
      columns: ['a.id', 'b.name', 'b.email', 'a.user_id'],
      order: `b.name asc`,
      idsCompareKey: 'a.id',
      ...body,
    };

    return new ProcessDbFind(this.sqlService).process(config);
  }

  @Get(':id')
  async showDetail(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    const bu = await BusinessUserEntity.findOne({ where: { business_id: business.id, id: params.id }, relations: ['user'] });
    if (!bu) throw new NotFoundException();

    return bu;
  }

  @Get()
  async all() {
    const business = await this.businessAccessService.validateAccess();
    return BusinessUserEntity.find({ where: { business_id: business.id, active: true }, relations: ['user'] });
  }

  @Get(':id/info')
  async show(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();

    const bu = await BusinessUserEntity.findOne({ where: { business_id: business.id, id: params.id }, relations: ['user'] });
    if (!bu) throw new NotFoundException();

    return bu;
  }

  @Post(':id/reassign-role/:second_id')
  async reassignRole(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const businessU = await BusinessUserEntity.findOne({ where: { business_id: business.id, id: params.id }, relations: ['business'] });

    await BusinessUserRoleEntity.softDelete({ business_user_id: businessU.id });

    const businessUserRole = BusinessUserRoleEntity.create({ business_user_id: businessU.id });
    businessUserRole.role_group_id = params.second_id;

    return businessUserRole.save();
  }

  @Delete(':id')
  async delete(@Param() params: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const businessU = await BusinessUserEntity.findOne({ where: { business_id: business.id, id: params.id }, relations: ['business'] });

    if (!businessU) throw new OperationException('Invalid businessU');
    if (businessU.business.owner_id === businessU.user_id) throw new OperationException('Owner of the business cannot be deleted');

    return businessU.softDelete();
  }

  @Post(':id/set-manager')
  async addAssignee(@Body() body: AddAssigneePayloadDto, @Param() param: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const businessU = await CommunicationBusinessUserEntity.findOne({ where: { business_id: business.id, id: param.id }, relations: ['business'] });

    if (!businessU) throw new OperationException('Invalid businessU');
    if (businessU.business.owner_id === businessU.user_id) throw new OperationException('Owner of the business cannot be Edited');

    businessU.manager_id = body.assignee_id;
    return businessU.save();
  }

  @Post(':id/activate')
  async activate(@Param() params: BusinessParamDto) {
    return this.handleStatus(true, params.id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param() params: BusinessParamDto) {
    return this.handleStatus(false, params.id);
  }

  async handleStatus(status: boolean, id: number) {
    const business = await this.businessAccessService.validateAccess();

    const r = await BusinessUserEntity.findOne({
      where: { id, business_id: business.id },
      relations: ['business'],
    });

    if (r.business.owner_id === r.user_id) throw new OperationException('You cannot perform the operation on owner');
    if (!r) throw new NotFoundException();

    if (status === r.active) throw new OperationException(`Invalid Operation`);
    r.active = status;

    return r.save();
  }
}
