import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Auth, OperationException } from '@servicelabsco/nestjs-utility-services';
import { Request } from 'express';
import { CommunicationBusinessUserEntity } from '../../business/entities/communication.business.user.entity';
import { BusinessAccessService } from '../../business/services/business.access.service';
import { FacebookInternalService } from '../../business/services/facebook.internal.service';
import { BusinessOnboardingPayloadDto } from '../dtos/business.onboarding.payload.dto';
import { BusinessMetaIntegrationService } from '../services/business.meta.integration.service';
import { BusinessService } from '../services/business.service';

@Controller('api/business')
export class BusinessController {
  constructor(
    protected readonly businessService: BusinessService,
    protected readonly businessAccessService: BusinessAccessService,
    protected readonly facebookInternalService: FacebookInternalService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService
  ) {}

  @Get()
  async getBusiness() {
    const user = Auth.user();
    if (!user) throw new OperationException('Invalid User');
    return CommunicationBusinessUserEntity.find({ where: { user_id: user.id }, relations: ['business'] });
  }

  @Post('on-board')
  async onBoard(@Body() body: BusinessOnboardingPayloadDto, @Req() req: Request) {
    const user = Auth.user();
    if (!user) throw new OperationException('Invalid User');

    return this.businessService.businessOnboarding(body, user.id, req);
  }

  @Post('set-access-token')
  async setAccessToken(@Body() body: any) {
    const validation = await this.businessAccessService.validateAccess();
    const data = body?.data;

    return this.businessMetaIntegrationService.connectClient(validation.id, data);
  }

  @Post('set-internal-id')
  async sendMetaCode(@Body() body: any) {
    const validation = await this.businessAccessService.validateAccess();
    const data = body?.data;

    return this.businessMetaIntegrationService.connectClient(validation.id, data);
  }
}
