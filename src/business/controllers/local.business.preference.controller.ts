import { Body, Controller, Param, Post } from '@nestjs/common';
import { AccessBusinessParamDto, AccessBusinessService, BusinessPreferenceEntity } from '@servicelabsco/slabs-access-manager';

@Controller('api/b/business-preference')
export class LocalBusinessPreferenceController {
  constructor(private readonly accessBusinessService: AccessBusinessService) {}

  @Post(':slug')
  async create(@Param() params: AccessBusinessParamDto, @Body() body: any) {
    const business = await this.accessBusinessService.validateAccess();

    const r = await BusinessPreferenceEntity.firstOrNew({ business_id: business.id, name: params.slug.toLowerCase() });

    r.preference = body.preference;

    return r.save();
  }
}
