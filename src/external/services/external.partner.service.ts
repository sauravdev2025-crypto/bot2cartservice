import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService, CacheService } from '@servicelabsco/nestjs-utility-services';
import { ApiAccountEntity } from '@servicelabsco/slabs-access-manager';
import { plainToClass } from 'class-transformer';
import { addDays, addHours } from 'date-fns';
import { CreatePartnerBusinessDto } from '../../business/dtos/create.partner.business.dto';
import { BusinessEntity } from '../../business/entities/business.entity';
import { ProcessApiAccountData } from '../../business/libraries/process.api.account.data';
import { PartnerBusinessService } from '../../business/services/partner.business.service';
import { CommunicationUserEntity } from '../../utility/entities/communication.user.entity';
import { BusinessService } from '../../utility/services/business.service';
import { ExternalApiAccountResponseDto } from '../dtos/external.api.account.response.dto';
import { ExternalBusinessResponseDto } from '../dtos/external.business.response.dto';
import { ExternalValidationUrlDto } from '../dtos/external.validation.url.dto';
import { GenerateClientSecretDto } from '../dtos/generate.client.secret.dto';

@Injectable()
export class ExternalPartnerService {
  constructor(
    protected businessService: BusinessService,
    protected partnerBusinessService: PartnerBusinessService,
    protected authService: AuthService,
    protected cacheService: CacheService
  ) {}

  /**
   * Get business details by ID
   * @param businessId - The business ID
   * @returns Promise<ExternalBusinessResponseDto>
   */
  async getBusinesses(businessId: number): Promise<ExternalBusinessResponseDto[]> {
    const childBusinesses = await BusinessEntity.find({
      where: { parent_id: businessId },
      relations: ['owner', 'parent'],
    });

    return Promise.all(childBusinesses.map((business) => this.transformToBusinessResponseDto(business)));
  }

  /**
   * Get business details by ID (for partner access)
   * @param businessId - The business ID
   * @returns Promise<ExternalBusinessResponseDto>
   */
  async getBusinessById(businessId: number): Promise<ExternalBusinessResponseDto> {
    const business = await BusinessEntity.findOne({
      where: { id: businessId },
      relations: ['owner', 'parent'],
    });

    if (!business) throw new NotFoundException('Business not found');

    return this.transformToBusinessResponseDto(business);
  }

  /**
   * Create a new business
   * @param createBusinessDto - The business creation data
   * @param partnerBusinessId - The partner business ID creating this business
   * @returns Promise<ExternalBusinessResponseDto>
   */
  async createBusiness(createBusinessDto: CreatePartnerBusinessDto, partnerBusiness: BusinessEntity): Promise<ExternalBusinessResponseDto> {
    const business = await this.partnerBusinessService.createBusiness(createBusinessDto, partnerBusiness);
    return this.transformToBusinessResponseDto(business);
  }

  async generateClientSecret(clientSecretDto: GenerateClientSecretDto, business_id: number): Promise<ExternalApiAccountResponseDto> {
    const business = await BusinessEntity.first(business_id);
    const apiAccounts = await new ProcessApiAccountData(business).process(clientSecretDto);
    return this.transformToApiAccountResponseDto(apiAccounts);
  }

  async generateValidationUrl(partner: BusinessEntity, business_id: number): Promise<ExternalValidationUrlDto> {
    const key = `generateValidationUrl.${business_id}.${partner.id}`;
    const data = await this.cacheService.get(key);
    if (data) return data;

    const expires_at = addDays(new Date(), 1);
    const token = await this.authService.signJwtToken({ partner_business_id: partner.id, business_id, expires_at });
    const url = `https://app.dartinbox.com/p/connect-client?token=${token}&business_name=${partner?.name}&backend_url=${process.env?.SERVER_URL}`;
    const payload = { url, expires_at };

    await this.cacheService.set(key, payload, addHours(new Date(), 12));
    return payload;
  }

  async getSetBusiness(parent_id: number, owner_id: number, business_name: string) {
    const business = await BusinessEntity.firstOrNew({ active: true, parent_id, owner_id, name: business_name });
    return business.save();
  }

  /**
   * Transform BusinessEntity to ExternalBusinessResponseDto
   * @param business - The business entity
   * @returns ExternalBusinessResponseDto
   */
  private async transformToBusinessResponseDto(business: any): Promise<ExternalBusinessResponseDto> {
    const owner = await CommunicationUserEntity.first(business.owner_id);
    return plainToClass(
      ExternalBusinessResponseDto,
      { ...business, owner_name: owner?.name, owner_email: owner.email },
      {
        excludeExtraneousValues: true,
      }
    );
  }

  private async transformToApiAccountResponseDto(accounts: ApiAccountEntity): Promise<ExternalApiAccountResponseDto> {
    return plainToClass(ExternalApiAccountResponseDto, accounts, {
      excludeExtraneousValues: true,
    });
  }
}
