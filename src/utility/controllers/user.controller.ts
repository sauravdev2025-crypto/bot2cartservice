import { Body, Controller, Get, Post } from '@nestjs/common';
import { Auth, OperationException, UserEntity } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity } from '@servicelabsco/slabs-access-manager';
import { BusinessAccessService } from '../../business/services/business.access.service';
import { ChangePasswordDto, ChangeUserMobileDto, UserProfileDto } from '../dtos/user.profile.dto';
import { VerifyMobileJob } from '../jobs/verify.mobile.job';
import { LoginService } from '../services/login.service';
import { MobileValidationService } from '../services/mobile.validation.service';

@Controller('api/b/user')
export class UserController {
  constructor(
    protected readonly businessAccessService: BusinessAccessService,
    protected readonly verifyMobileJob: VerifyMobileJob,
    protected readonly mobileValidationService: MobileValidationService,
    protected readonly loginService: LoginService
  ) {}

  @Post('update-profile-picture')
  async updateUserProfile(@Body() body: UserProfileDto) {
    const { user } = await this.nestedValidation();
    user.image_url = body.image_url;
    return user.save();
  }

  @Post('update-profile-name')
  async updateUserName(@Body() body: UserProfileDto) {
    const { user } = await this.nestedValidation();
    user.name = body.name;
    return user.save();
  }

  @Post('update-mobile')
  async updateMobile(@Body() body: ChangeUserMobileDto) {
    const { user } = await this.nestedValidation();

    if (!body.otp) {
      const record = await this.mobileValidationService.generate(body?.dialing_code, body.mobile, 'verify-mobile', {
        validityInMinutes: 5,
      });

      if (record.otp) await this.verifyMobileJob.dispatch({ otp: record.otp, dialing_code: record.dialing_code, mobile: record.mobile });
      return { sent_otp: true };
    }

    const validate = await this.mobileValidationService.validate({
      dialing_code: body.dialing_code,
      mobile: body.mobile,
      otp: +body.otp,
      type: 'verify-mobile',
    });
    if (!validate) throw new OperationException('Invalid Otp');

    user.dialing_code = body.dialing_code;
    user.mobile = body.mobile;
    user.mobile_verified_at = new Date();

    return user.save();
  }
  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto) {
    const { user } = await this.nestedValidation();

    const changePassword = await this.loginService.changePassword(user.id, body);
    if (!changePassword) throw new OperationException('Error Changing the password');

    return changePassword;
  }

  @Get('user-business')
  async getUserBusiness() {
    const { user } = await this.nestedValidation();
    return BusinessUserEntity.find({ where: { user_id: user.id }, relations: ['business'] });
  }

  async nestedValidation() {
    const business = await this.businessAccessService.validateAccess();
    const user_id = Auth.user().id;

    const businessUser = await BusinessUserEntity.findOne({ where: { active: true, business_id: business.id, user_id } });
    if (!businessUser) throw new OperationException('You are not the user of this business');

    const user = await UserEntity.first(user_id);

    return { business, user };
  }
}
