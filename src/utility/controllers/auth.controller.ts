import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  AccessException,
  Auth,
  AuthService,
  ClassMapper,
  Hash,
  MailValidationService,
  OperationException,
  UserAccessDto,
} from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, BusinessUserRoleService } from '@servicelabsco/slabs-access-manager';
import { Request } from 'express';
import { BusinessEntity } from '../../business/entities/business.entity';
import { EmailVerificationDto } from '../dtos/email.verification.dto';
import { ForgetPasswordPayloadDto, ForgetPasswordValidationPayloadDto } from '../dtos/forget.password.payload.dto';
import { LoginPayloadDto } from '../dtos/login.payload.dto';
import { SignupPayloadDto } from '../dtos/signup.payload.dto';
import { CommunicationUserEntity } from '../entities/communication.user.entity';
import { SendForgetPasswordEmailJob } from '../jobs/send.forget.password.email.job';
import { BusinessMetaIntegrationService } from '../services/business.meta.integration.service';
import { LoginService } from '../services/login.service';
import { SignupService } from '../services/signup.service';

/**
 * @module AuthController
 * @description This controller handles authentication-related routes such as login, logout, and user checks.
 */

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginService: LoginService,
    private readonly signupService: SignupService,
    private readonly authService: AuthService,
    private readonly mailValidationService: MailValidationService,
    private readonly sendForgetPasswordEmailJob: SendForgetPasswordEmailJob,
    private readonly businessUserRoleService: BusinessUserRoleService,
    private readonly businessMetaIntegrationService: BusinessMetaIntegrationService
  ) {}

  /**
   * @route POST /auth/login
   * @param {LoginPayloadDto} body - The login credentials.
   * @param {Request} req - The HTTP request object.
   * @returns {Promise<any>} The result of the login attempt.
   * @throws {AccessException} If login fails.
   * @description This endpoint allows users to log in using their credentials.
   */
  @Post('login')
  async login(@Body() body: LoginPayloadDto, @Req() req: Request) {
    return this.loginService.loginViaPassword(body, req);
  }

  @Post('signup')
  async signup(@Body() body: SignupPayloadDto, @Req() req: Request) {
    return this.signupService.signup(body);
  }

  @Post('verify-email')
  async validateEmail(@Body() body: EmailVerificationDto) {
    const authService = await this.authService.verifyJwtToken(body?.token);
    if (!authService) throw new OperationException('Invalid Code');

    const validation = await this.mailValidationService.validate({ code: body?.code, email: body.email, type: 'verify-email' });
    if (!validation) throw new OperationException('Invalid Code');

    return this.signupService.signup(authService?.payload, true);
  }

  @Post('send-forget-email')
  async sendForgetPassword(@Body() body: ForgetPasswordPayloadDto) {
    const user = await CommunicationUserEntity.findOne({ where: { email: body.email } });
    if (!user) throw new OperationException('you are not the user of the app');

    await this.sendForgetPasswordEmailJob.dispatch(user);

    return {
      success: true,
    };
  }

  @Post('reset-password')
  async forgetPassword(@Body() body: ForgetPasswordValidationPayloadDto) {
    const user = await CommunicationUserEntity.findOne({ where: { email: body.email } });
    if (!user) throw new OperationException('you are not the user of the app');

    const authService = await this.authService.verifyJwtToken(body?.token);
    if (!authService) throw new OperationException('Invalid Code');

    user.password = Hash.hash(body.password);
    user.password_reset_at = new Date();

    await user.save();

    return {
      success: true,
    };
  }

  @Post('send-verify-email')
  async sendVerifyEmail(@Body('email') email: string) {
    return this.signupService.sendEmailVerification(email);
  }

  @Post('google')
  async googleLogin(@Body('access_token') token: string, @Req() req: Request) {
    return this.loginService.loginViaGoogle(token, req, false);
  }

  @Post('validate-token')
  async validateToken(@Body() body: BusinessParamDto, @Req() req: Request) {
    return this.loginService.validateBusinessToken(Auth.user().id, body?.id, req);
  }

  @Get()
  async check() {
    const user: UserAccessDto = Auth.user();
    if (!user) throw new AccessException();

    const businessId = user?.auth_attributes?.business_id;
    const business = ClassMapper.removeWhoColumns(await BusinessEntity.first(businessId));

    if (user.auth_attributes?.business_id) {
      const roles = await this.businessUserRoleService.setUserRoles(Number(businessId), user.id);

      user.roles = roles.roles;
      user.role_identifiers = roles.role_identifiers;
    }

    return { ...user, business };
  }

  /**
   * @route POST /auth/logout
   * @returns {Promise<any>} The result of the logout attempt.
   * @description This endpoint allows users to log out of their session.
   */
  @Post('logout')
  async logout() {
    const user = Auth.user();
    if (!user) return;

    return this.authService.revokeSession();
  }

  @Post('connect-client')
  async connectClient(@Body() body: any) {
    const business = await this.validateClient(body?.token);
    return this.businessMetaIntegrationService.connectClient(body, business?.id);
  }

  @Post('validate-public-token')
  async validatePublicToken(@Body() body: any) {
    return this.validateClient(body?.token);
  }

  async validateClient(token: string) {
    const validate = await this.authService.verifyJwtToken(token);
    if (!validate) throw new OperationException('Invalid Token');

    const isExpired = new Date() > new Date(validate?.expires_at);
    if (isExpired) throw new OperationException('Token Is expired');

    return BusinessEntity.first(validate?.business_id);
  }
}
