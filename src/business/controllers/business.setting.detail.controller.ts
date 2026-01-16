import { Body, Controller, Get, Post } from '@nestjs/common';
import { SetBusinessSettingsDto } from '../dtos/set.business.settings.dto';
import { BusinessAccessService } from '../services/business.access.service';
import { BusinessSettingsService } from '../services/business.settings.service';

/**
 * create controller for BusinessSettingDetail
 * @export
 * @class BusinessSettingDetailController
 */
@Controller('api/b/business-settings')
export class BusinessSettingDetailController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly businessSettingService: BusinessSettingsService
  ) {}

  @Get()
  async search() {
    const business = await this.businessAccessService.validateAccess();
    return this.businessSettingService.getSettings(business.id);
  }

  @Post()
  async create(@Body() body: SetBusinessSettingsDto) {
    const business = await this.businessAccessService.validateAccess();
    return this.businessSettingService.setSettings(body, business.id);
  }
}
