import { Injectable } from '@nestjs/common';
import { AccessException, Auth } from '@servicelabsco/nestjs-utility-services';
import { BusinessEntity } from '../../business/entities/business.entity';
import { CommunicationApiAccountEntity } from '../../business/entities/communication.api.account.entity';

@Injectable()
export class ExternalAccessService {
  constructor() {}

  async validateAccess(): Promise<BusinessEntity> {
    const user = Auth.user();

    const client_id = user?.auth_attributes?.client_id?.client_id;
    if (!client_id) throw new AccessException();

    const client = await CommunicationApiAccountEntity.findOne({ where: { identifier: client_id, active: true } });
    if (!client) throw new AccessException('Invalid Client');

    const business = await BusinessEntity.findOne({ where: { id: client?.business_id } });
    if (!business) throw new AccessException();

    return business;
  }

  async validatePartnerAccess(): Promise<BusinessEntity> {
    const business = await this.validateAccess();
    if (!business?.is_partner_account) throw new AccessException('This apis can only be access by partner accounts');
    return business;
  }
}
