import { Injectable } from '@nestjs/common';
import { AuthService, Hash, MailValidationService, OperationException, UserEntity } from '@servicelabsco/nestjs-utility-services';
import { SignupPayloadDto } from '../dtos/signup.payload.dto';
import { VerifyEmailJob } from '../jobs/verify.email.job';

@Injectable()
export class SignupService {
  constructor(
    protected readonly mailValidationService: MailValidationService,
    protected readonly verifyEmailJob: VerifyEmailJob,
    protected readonly authService: AuthService
  ) {}

  async signup(payload: SignupPayloadDto, isValidated: boolean = false) {
    const isValidEmail = await this.isNewEmail(payload.email?.toLowerCase());
    if (!isValidEmail) throw new OperationException('User Already Exist with this email');

    const user = UserEntity.create({});

    user.email = payload?.email?.toLowerCase();
    user.password = Hash.hash(payload.password);

    // user.mobile = payload.mobile;
    // user.dialing_code = +payload.dial_code;

    user.name = payload.name;

    if (!isValidated) {
      const validation = await this.sendEmailVerification(user?.email);
      const code = await this.authService.signJwtToken({ validation, payload });

      return { code, email: user.email };
    }

    user.email_verified_at = new Date();
    return user.save();
  }

  async sendEmailVerification(email: string) {
    const record: any = await this.mailValidationService.generate(email, 'verify-email', { validityInMinutes: 1440 });
    if (!record?.id) return { email: email };

    await this.verifyEmailJob.dispatch(record);
    return record;
  }

  async isNewEmail(email: string) {
    const userWithEmail = await UserEntity.count({ where: { email: email } });
    return userWithEmail <= 0;
  }
}
