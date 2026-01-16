import { Injectable } from '@nestjs/common';
import {
  DateUtil,
  MobileValidationDto,
  MobileValidationEntity,
  OperationException,
  PlatformUtility,
  PropertyService,
  ValidationOptionsDto,
} from '@servicelabsco/nestjs-utility-services';
import { IsNull, MoreThan } from 'typeorm';

/**
 * validate mobile service
 * @export
 * @class MobileValidationService
 */
@Injectable()
export class MobileValidationService {
  constructor(private readonly propertyService: PropertyService) {}
  /**
   * only on production will it be allowed
   * @param {*} payload
   * @return {*}
   * @memberof OtpValidationService
   */
  async generate(dialing_code: number, mobile: number, type: string, options?: ValidationOptionsDto) {
    const now = new Date();

    // check for the existing otp is unused by the user
    const record = await MobileValidationEntity.firstOrNew({
      dialing_code,
      mobile,
      type,
      completed_on: IsNull(),
      validity: MoreThan(now),
    });

    // dont attempt to retrigger if triggered again so quickly
    const retriggerLimit = await this.propertyService.get('mobile.otp.retrigger.minutes', 1);

    if (record.id && DateUtil.getFutureDateTime(+retriggerLimit, record.created_at) > DateUtil.getDateTime()) {
      throw new OperationException(`Retry attempted too early.. please wait for ${retriggerLimit}  minute(s)`);
    }

    const maxAttempts = await this.getMaxAttempts();

    if (record.id && record.attempts > +maxAttempts)
      throw new OperationException(`Too many attempts.. please wait for 15 minutes to request new OTP`);

    if (!record.otp) {
      record.otp = this.getRandomOtp();
      record.attempts = 0;
    }

    record.validity = DateUtil.getFutureDateTime(options.validityInMinutes || 15);
    record.completed_on = null;

    const attributes = options.attributes || {};
    record.attributes = { ...record.attributes, ...attributes };

    return record.save();
  }

  /**
   * validate the otp against the given inputs
   * @param {*} payload
   * @return {*}
   * @memberof MobileValidationService
   */
  async validate(payload: MobileValidationDto & { dialing_code: number }) {
    const now = new Date();
    const validation = await MobileValidationEntity.findOne({
      where: {
        dialing_code: payload.dialing_code,
        mobile: payload.mobile,
        type: payload.type,
        completed_on: IsNull(),
        validity: MoreThan(now),
      },
    });

    if (!validation) return false;

    const maxAttempts = await this.getMaxAttempts();
    if (validation.attempts > maxAttempts) return false;

    if (validation.otp !== payload.otp) {
      validation.attempts += 1;
      await validation.save();

      return false;
    }

    validation.completed_on = DateUtil.getDateTime();
    return validation.save();
  }

  /**
   * generate random otp against the given request
   * @private
   * @return {*}
   * @memberof OtpValidationService
   */
  private getRandomOtp(): number {
    const isProduction = PlatformUtility.isProductionEnvironment();

    return isProduction ? PlatformUtility.generateRandomNumber(4) : 1111;
  }

  /**
   * get the max number of attempts during validation period
   * @private
   * @return {*}  {Promise<number>}
   * @memberof MobileValidationService
   */
  private async getMaxAttempts(): Promise<number> {
    const attempts = await this.propertyService.get('mobile.otp.max.attempts', 5);

    return +attempts;
  }
}
