import { Injectable } from '@nestjs/common';
import { CacheService, PlatformUtility } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity, BusinessUserRoleEntity, ProcessBusinessUserRoleUpdate } from '@servicelabsco/slabs-access-manager';
import { addMinutes } from 'date-fns';
import { Request } from 'express';
import { BusinessEntity } from '../../business/entities/business.entity';
import { BusinessOnboardingPayloadDto } from '../dtos/business.onboarding.payload.dto';
import { CommunicationUserEntity } from '../entities/communication.user.entity';
import { LoginService } from './login.service';

@Injectable()
export class BusinessService {
  constructor(
    protected readonly cacheService: CacheService,
    private readonly loginService: LoginService
  ) {}

  async getBusiness(id: number) {
    const key = `business.${id}.details`;
    const data = await this.cacheService.get(key);
    if (data) return data;

    return this.reestCache(id);
  }

  async reestCache(id: number) {
    const key = `business.${id}.details`;

    const business = await BusinessEntity.first(id);
    if (!business) return;

    await this.cacheService.set(key, business, addMinutes(new Date(), 10));

    return business;
  }

  async businessOnboarding(payload: BusinessOnboardingPayloadDto, owner_id: number, req: Request) {
    const business = BusinessEntity.create({ name: payload.name });

    const user = await CommunicationUserEntity.first(owner_id);
    if (!user) return;

    business.active = true;
    business.owner_id = user.id;
    if (payload?.is_partner_account) business.is_partner_account = payload?.is_partner_account;

    await business.save();

    const bu = await this.setBusinessUser(business.id, user.id);
    // await this.setUserRole(bu.id, 1);

    return this.loginService.getUserLoginPayload(user, req, { business_id: business.id });
  }

  async setUserRole(buId: number, role_id: number = 1) {
    const ownerRole = BusinessUserRoleEntity.create({ business_user_id: buId, role_group_id: role_id });
    await ownerRole.save();

    await new ProcessBusinessUserRoleUpdate().process({ entity: ownerRole } as any);
    return ownerRole;
  }

  async setBusinessUser(business_id: number, user_id: number) {
    const businessUser = await BusinessUserEntity.firstOrCreate({ business_id, user_id });
    businessUser.active = true;

    return businessUser.save();
  }

  getFrontendUrl() {
    const isProd = PlatformUtility.isProductionEnvironment();
    if (isProd) return 'https://app.dartinbox.com';
    return 'https://dartinbox.vercel.app';
  }
}
