import { Injectable } from '@nestjs/common';
import { CacheService } from '@servicelabsco/nestjs-utility-services';
import { addDays } from 'date-fns';
import { SetBusinessSettingsDto } from '../dtos/set.business.settings.dto';
import { BusinessSettingDetailEntity } from '../entities/business.setting.detail.entity';

@Injectable()
export class BusinessSettingsService {
  /**
   * Constructor for BusinessSettingService
   * @param cacheService - Service for caching data
   */
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Retrieves business settings for a given business_id.
   * Attempts to fetch from cache first, otherwise loads from DB and caches the result.
   * @param business_id - The ID of the business
   * @returns The business settings entity
   */
  async getSettings(business_id: number) {
    const key = this.getKey(business_id);

    const data = await this.cacheService.get(key);
    if (data) return data;

    const settings = await BusinessSettingDetailEntity.findOne({ where: { business_id } });
    if (!settings) return this.initializeOnBusiness(business_id); // on initial there is no any settings so this will initialize

    await this.cacheService.set(key, settings, addDays(new Date(), 5));

    return settings;
  }

  /**
   * Initializes business settings for a given business_id.
   * If settings do not exist, creates them with default values.
   * @param business_id - The ID of the business
   * @returns The initialized business settings entity
   * @vsdoc
   * This method is typically called when no settings exist for a business.
   * It creates default settings and then retrieves them.
   */
  async initializeOnBusiness(business_id: number) {
    await this.setSettings(undefined, business_id);
    return this.getSettings(business_id);
  }

  /**
   * Retrieves a specific value from the business settings.
   * @param key - The key of the setting to retrieve
   * @param business_id - The ID of the business
   * @returns The value of the specified setting
   */
  async getValue(key: keyof SetBusinessSettingsDto, business_id: number) {
    const settings = await this.getSettings(business_id);
    return settings[key];
  }

  /**
   * Sets or updates business settings for a given business_id.
   * Only updates fields present in the data object.
   * @param data - The settings data to update
   * @param business_id - The ID of the business
   * @returns The saved settings entity
   */
  async setSettings(data: SetBusinessSettingsDto = {}, business_id: number) {
    const setting = await BusinessSettingDetailEntity.firstOrCreate({ business_id });

    Object.keys(data).forEach((key) => {
      if (typeof data[key] !== 'undefined' && key in setting) {
        setting[key] = data[key];
      }
    });

    await this.resetCache(business_id);
    return setting.save();
  }

  /**
   * Resets the cache for a given business_id.
   * @param business_id - The ID of the business
   * @returns The result of the cache reset operation
   */
  public resetCache(business_id: number) {
    const key = this.getKey(business_id);
    return this.cacheService.set(key, null);
  }

  /**
   * Generates the cache key for a given business_id.
   * @param business_id - The ID of the business
   * @returns The cache key string
   */
  private getKey(business_id: number) {
    return `business.settings.${business_id}.detail`;
  }
}
