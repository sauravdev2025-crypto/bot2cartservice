import { Injectable } from '@nestjs/common';
import { Hash, OperationException } from '@servicelabsco/nestjs-utility-services';

import { ExternalCreateBusinessDto } from '../../external/dtos/external.create.business.dto';
import { CommunicationUserEntity } from '../../utility/entities/communication.user.entity';
import { BusinessService } from '../../utility/services/business.service';
import { CreatePartnerBusinessDto } from '../dtos/create.partner.business.dto';
import { BusinessEntity } from '../entities/business.entity';

@Injectable()
export class PartnerBusinessService {
  constructor(protected businessService: BusinessService) {}

  /**
   * Create a new business
   * @param createBusinessDto - The business creation data
   * @param partnerBusinessId - The partner business ID creating this business
   * @returns Promise<ExternalBusinessResponseDto>
   */
  async createBusiness(createBusinessDto: CreatePartnerBusinessDto, partnerBusiness: BusinessEntity): Promise<BusinessEntity> {
    // Create new business entity
    const hasBusiness = await BusinessEntity.findOne({ where: { name: createBusinessDto.business_name, parent_id: partnerBusiness.id } });
    if (hasBusiness) throw new OperationException('Business With this name already exist');

    const owner = await this.createGetUser(createBusinessDto); // creating the user
    const business = await this.getSetBusiness(partnerBusiness.id, owner.id, createBusinessDto.business_name); // creating the business
    const businessUser = await this.businessService.setBusinessUser(business.id, owner.id); // assigning the business_user
    await this.businessService.setUserRole(businessUser.id, 1); // giving the owner role

    if (owner?.id === partnerBusiness?.owner_id) return business; // if the partner account owner is the owner of the new account

    const businessUserPartner = await this.businessService.setBusinessUser(business.id, partnerBusiness.owner_id); // adding partner to the business that he created
    await this.businessService.setUserRole(businessUserPartner.id, 2); // setting the admin role to the business he created

    return business;
  }

  async getSetBusiness(parent_id: number, owner_id: number, business_name: string) {
    const business = await BusinessEntity.firstOrNew({ active: true, parent_id, owner_id, name: business_name });
    return business.save();
  }

  async createGetUser(createBusinessDto: ExternalCreateBusinessDto) {
    const user = await CommunicationUserEntity.firstOrNew({ email: createBusinessDto.owner_email });

    if (!user?.name) user.name = createBusinessDto?.owner_name;
    if (!user?.password) user.password = Hash.hash(createBusinessDto?.password);

    return user.save();
  }
}
