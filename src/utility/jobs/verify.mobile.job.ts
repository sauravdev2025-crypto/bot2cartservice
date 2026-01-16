import { Injectable } from '@nestjs/common';
import { CommonJob, PropertyService, QueueService, RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import { MobileValidationService } from '../services/mobile.validation.service';

@Injectable()
export class VerifyMobileJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly mobileValidationService: MobileValidationService,
    protected readonly remoteRequestService: RemoteRequestService,
    protected readonly propertyService: PropertyService
  ) {
    super('e027f7aa6f004414f549cdd0bbd46ac6');
  }

  async handle({ mobile, dialing_code, otp }: { mobile: number; dialing_code: number; otp: number }) {}
}
