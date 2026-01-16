import { Injectable } from '@nestjs/common';
import {
  AccessException,
  Auth,
  CacheService,
  DateUtil,
  OperationException,
  PlatformUtility,
  SqlService,
} from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity, BusinessUserRoleEntity } from '@servicelabsco/slabs-access-manager';
import { addDays } from 'date-fns';
import { USER_BUSINESSES_LIST_CACHE_KEY } from '../../config/cache.keys';
import { CommunicationUserEntity } from '../../utility/entities/communication.user.entity';
import { BusinessEntity } from '../entities/business.entity';
import { BusinessTokenEntity } from '../entities/business.token.entity';
import { CommunicationBusinessUserEntity } from '../entities/communication.business.user.entity';
import { BusinessAccessService } from './business.access.service';

/**
 * Service for managing business user operations.
 * This service handles the retrieval of businesses associated with a user
 * and the generation of business tokens.
 */
@Injectable()
export class BusinessUserService {
  constructor(
    private readonly sqlService: SqlService,
    private readonly cacheService: CacheService
  ) {}
  /**
   * Retrieves a list of businesses associated with a given user.
   *
   * This method first checks the cache for the user's business list. If the data is not found in the cache,
   * it executes a SQL query to fetch the businesses from the database. The result is then cached for future
   * requests.
   *
   * @param {number} userId - The ID of the user for whom to retrieve businesses.
   * @returns {Promise<BusinessEntity[]>} A promise that resolves to an array of BusinessEntity objects.
   */
  async getBusinesses(userId: number): Promise<BusinessEntity[]> {
    // const cacheData = await this.cacheService.get(USER_BUSINESSES_LIST_CACHE_KEY);
    // if (cacheData) return cacheData;

    const sql = `SELECT a.*, b.name business_name, b.is_partner_account FROM bz_business_users a LEFT JOIN bz_business_details b ON b.id=business_id AND b.deleted_at IS NULL LEFT JOIN sys_users c ON c.id=a.user_id AND c.deleted_at IS NULL WHERE a.deleted_at IS NULL and b.active=TRUE and a.user_id=${userId} and a.active = true`;
    const data = await this.sqlService.sql(sql);

    const expired_at = addDays(new Date(), 2);
    this.cacheService.set(USER_BUSINESSES_LIST_CACHE_KEY, data, expired_at);

    return data;
  }

  /**
   * Generates a business token for a specified business.
   *
   * This method checks if the business is active and if the user is the owner. It then retrieves the business
   * users associated with the business and generates a token if exactly one user is found.
   *
   * @param {number} businessId - The ID of the business for which to generate a token.
   * @returns {Promise<BusinessTokenEntity>} A promise that resolves to a BusinessTokenEntity object.
   * @throws {AccessException} If the business is not active and the user is not the owner.
   * @throws {OperationException} If no business users are found or if more than one product is assigned to the user.
   */
  async generateBusinessToken(businessId: number): Promise<BusinessTokenEntity> {
    const user = Auth.user();

    const business = await BusinessEntity.first(businessId);

    if (!business.active && business.owner_id !== user.id) throw new AccessException();

    const businessUsers = await BusinessUserEntity.find({
      where: { business_id: businessId, user_id: user.id },
      relations: ['product'],
    });

    if (!businessUsers.length) throw new OperationException(`Cannot find appropriate business for the user`);

    if (businessUsers.length == 1) return this.generateBusinessProductToken(businessId);

    throw new OperationException(`There are more than 1 products assigned with this user in this org`);
  }

  /**
   * Generates a product token for a specified business.
   *
   * This method creates a new token for the user associated with the business and sets its expiration time.
   *
   * @param {number} businessId - The ID of the business for which to generate a product token.
   * @returns {Promise<BusinessTokenEntity>} A promise that resolves to a BusinessTokenEntity object.
   */
  async generateBusinessProductToken(businessId: number): Promise<BusinessTokenEntity> {
    const user = Auth.user();

    const token = BusinessTokenEntity.create({
      user_id: user.id,
      business_id: businessId,
    });

    token.token = PlatformUtility.generateRandomNumber(8);
    token.expired_at = DateUtil.getFutureDateTime(5);

    return token.save();
  }

  /**
   * Checks if a user is assigned to a specific business based on their email.
   *
   * @param {string} email - The email of the user to check.
   * @param {number} businessId - The ID of the business to check against.
   * @returns {Promise<boolean>} A promise that resolves to true if the user is assigned to the business, false otherwise.
   */
  async checkIfUserAssignedAgainstBusiness(email: string, businessId: number) {
    const user = await CommunicationUserEntity.findOne({ where: { email } });
    if (!user) return false;

    const bu = await BusinessUserEntity.findOne({
      where: { user_id: user.id, business_id: businessId },
    });

    if (bu) return true;

    return false;
  }

  /**
   * Checks if multi-factor authentication (MFA) is required for a user.
   *
   * @param {number} userId - The ID of the user to check.
   * @returns {Promise<boolean>} A promise that resolves to true if MFA is required, false otherwise.
   */
  async isMfaRequired(userId: number) {
    const businessUsers = await CommunicationBusinessUserEntity.find({
      where: { user_id: userId },
    });

    for (const businessUser of businessUsers) {
      if (businessUser.mfa_required) return true;
    }

    return false;
  }

  /**
   * Returns an array of manager IDs for the given business user ID,
   * traversing up the manager chain (multi-level).
   * @param buId - The business user ID to start from
   * @returns Promise<number[]> - Array of manager IDs (ordered from direct manager up)
   */
  async getAllManagers(buId: number): Promise<number[]> {
    const ids: number[] = [buId];
    let currentBu = await CommunicationBusinessUserEntity.first(buId);

    // Traverse up the manager chain
    while (currentBu && currentBu.manager_id) {
      ids.push(currentBu.manager_id);
      currentBu = await CommunicationBusinessUserEntity.first(currentBu.manager_id);
    }

    // Add my employees (those who have me as their manager)
    if (currentBu) {
      const myEmps = await CommunicationBusinessUserEntity.find({
        where: { business_id: currentBu.business_id, manager_id: buId },
      });
      for (const emp of myEmps) {
        if (!ids.includes(emp.id)) {
          ids.push(emp.id);
        }
      }
    }

    return ids;
  }

  async getRole(id: number) {
    const bu = await CommunicationBusinessUserEntity.first(id);
    const businessUserRole = await BusinessUserRoleEntity.findOne({ where: { business_user_id: bu.id }, relations: ['role_group'] });
    return businessUserRole?.role_group;
  }

  async getCurrentUserRole() {
    const user = Auth.user();
    const businessId = user?.auth_attributes?.business_id;
    if (!businessId) return;

    const bu = await CommunicationBusinessUserEntity.findOne({ where: { user_id: user.id, business_id: businessId, active: true } });
    if (!bu) return;

    const businessUserRole = await BusinessUserRoleEntity.findOne({ where: { business_user_id: bu.id }, relations: ['role_group'] });
    return businessUserRole?.role_group;
  }
}
