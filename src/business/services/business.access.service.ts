import { Injectable } from '@nestjs/common';
import { AccessException, AccessService, Auth, OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserRoleEntity } from '@servicelabsco/slabs-access-manager';
import { BusinessEntity } from '../entities/business.entity';
import { CommunicationBusinessUserEntity } from '../entities/communication.business.user.entity';

/**
 * Service for managing business access and permissions.
 * This service validates user access to business entities and checks user roles.
 */
@Injectable()
export class BusinessAccessService {
  constructor(private readonly accessService: AccessService) {}

  /**
   * Validates access for the current user by checking if they have a valid business ID
   * and if the corresponding business is active.
   *
   * @returns {Promise<BusinessEntity>} The active business entity associated with the user.
   * @throws {AccessException} If the user does not have a business ID or if the business is not found or inactive.
   */
  async validateAccess(validateInternalAccessToken: boolean = false): Promise<BusinessEntity> {
    const user = Auth.user();

    const businessId = user?.auth_attributes?.business_id;
    if (!businessId) throw new AccessException();

    const business = await BusinessEntity.findOne({
      where: { id: businessId, active: true },
    });
    if (!business) throw new AccessException();

    if (validateInternalAccessToken && !business?.internal_access_token) throw new AccessException('Log into facebook to access this');

    return business;
  }

  async validatePartnerBusiness() {
    const validate = await this.validateAccess();
    if (!validate?.is_partner_account) throw new OperationException('Only Partner account can create the business');
    return validate;
  }

  /**
   * check if user has any one of the given roles
   * @param {string[]} roles
   * @return {*}
   * @memberof BusinessAccessService
   */
  async hasRoles(roles: string[]): Promise<BusinessEntity> {
    const business = await this.validateAccess();

    if (roles?.length > 0) {
      await this.validateRoles(roles);
    }

    return business;
  }

  /**
   * Validates if the user has the specified roles.
   *
   * @param {string[]} roles - An array of role identifiers to check against the user's roles.
   * @throws {AccessException} If the user does not have the appropriate roles to perform the operation.
   */
  async validateRoles(roles: string[]) {
    const hasRole = await this.accessService.hasRoleIdentifiers(roles);

    if (!hasRole) throw new AccessException(`You don't have appropriate role to do this operation`);
  }

  async getMyGroupRole(business_id: number) {
    const bu = await CommunicationBusinessUserEntity.findOne({ where: { business_id, user_id: Auth.user().id } });
    const businessUserRole = await BusinessUserRoleEntity.findOne({ where: { business_user_id: bu.id }, relations: ['role_group'] });
    return businessUserRole?.role_group;
  }

  async getInternalProperties(id: number) {
    const business = await BusinessEntity.first(id);
    if (!business) return;
    return { internal_id: business.internal_id, access_token: business.internal_access_token, internal_number: business.internal_number, business };
  }

  async getBusinessFromIdentifier(internal_id: string): Promise<BusinessEntity> {
    const business = await BusinessEntity.findOne({ where: { internal_id } });
    if (!business) return;
    return business;
  }
}
