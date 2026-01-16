import { Body, Controller, Post } from '@nestjs/common';
import { CommonListFilterDto, ListingService } from '@servicelabsco/slabs-access-manager';
import { ProcessPartnerAccountBusinessList } from '../libraries/process.partner.account.business.list';
import { BusinessAccessService } from '../services/business.access.service';
import { CreatePartnerBusinessDto } from '../dtos/create.partner.business.dto';
import { PartnerBusinessService } from '../services/partner.business.service';

@Controller('api/b/parent-business')
export class PartnerBusinessController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly listingService: ListingService,
    private readonly partnerBusinessService: PartnerBusinessService
  ) {}

  @Post('search')
  async search(@Body() body: CommonListFilterDto) {
    const business = await this.businessAccessService.validatePartnerBusiness();
    return new ProcessPartnerAccountBusinessList(business, this.listingService).process(body);
  }

  @Post()
  async create(@Body() body: CreatePartnerBusinessDto) {
    const business = await this.businessAccessService.validatePartnerBusiness();
    return this.partnerBusinessService.createBusiness(body, business);
  }
}
