import { Controller, Get, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Auth, OpenPropertyEntity, OperationException } from '@servicelabsco/nestjs-utility-services';
import {
  BusinessParamDto,
  BusinessUserEntity,
  BusinessUserRoleEntity,
  ProcessBusinessUserRoleUpdate,
  RoleGroupEntity,
  UtilityService,
} from '@servicelabsco/slabs-access-manager';
import { In, Not } from 'typeorm';
import { BusinessUserInvitationEntity } from '../../business/entities/business.user.invitation.entity';
import { FileUploadService } from '../services/file.upload.service';

@Controller('api')
export class LoggedUtilityController {
  constructor(
    private readonly utilityService: UtilityService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Get('lookup-type/:id/values')
  getLookupValues(@Param() params: BusinessParamDto) {
    return this.utilityService.getLookupValues(params.id);
  }

  @Get('product-user/:id/roles')
  getRoles(@Param() params: BusinessParamDto) {
    return RoleGroupEntity.find({ where: { product_id: params.id, id: Not(In([1])) } });
  }

  @Post('b/upload-files')
  @UseInterceptors(AnyFilesInterceptor())
  file(@UploadedFiles() files) {
    return this.uploadFile(files);
  }

  @Get('open-property')
  findOpenProperties() {
    return OpenPropertyEntity.find();
  }

  @Post('v/upload-files')
  @UseInterceptors(AnyFilesInterceptor())
  vendorFile(@UploadedFiles() files) {
    return this.uploadFile(files);
  }

  @Post('invited-user/:id/accept')
  async acceptUserInvitation(@Param() param: BusinessParamDto) {
    const user = Auth.user();
    if (!user) throw new OperationException('Invalid User');

    const businessInv = await BusinessUserInvitationEntity.findOne({ where: { id: param.id } });
    if (!businessInv) throw new OperationException('Invalid Invitation');

    businessInv.accepted_at = new Date();

    const buUser = await this.setBusinessUser(businessInv, user.id);

    const role = BusinessUserRoleEntity.create({ business_user_id: buUser.id });
    role.role_group_id = businessInv.role_id;
    await role.save();

    await new ProcessBusinessUserRoleUpdate().process({ entity: role } as any);

    return businessInv.save();
  }

  async setBusinessUser(entity: BusinessUserInvitationEntity, user_id: number) {
    const businessUser = BusinessUserEntity.create({ business_id: entity.business_id, user_id });

    businessUser.active = true;

    businessUser.created_by = entity.created_by;
    businessUser.updated_by = entity.created_by;

    return businessUser.save();
  }

  async setRole() {}
  @Post('invited-user/:id/reject')
  async rejectUserInvitation(@Param() param: BusinessParamDto) {
    const user = Auth.user();
    if (!user) throw new OperationException('Invalid User');

    const businessInv = await BusinessUserInvitationEntity.findOne({ where: { id: param.id } });
    if (!businessInv) throw new OperationException('Invalid Invitation');

    businessInv.rejected_at = new Date();
    return businessInv.save();
  }

  private async uploadFile(files) {
    const urls = [];

    if (!Array.isArray(files)) return urls;

    for (const file of files) {
      urls.push(await this.fileUploadService.uploadFile(file));
    }

    return urls;
  }
}
