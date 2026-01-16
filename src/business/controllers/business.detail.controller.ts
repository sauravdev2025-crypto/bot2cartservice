import { Controller, Get, NotFoundException } from '@nestjs/common';
import { BusinessEntity } from '../entities/business.entity';
import { BusinessAccessService } from '../services/business.access.service';

@Controller('api/b/business-detail')
export class BusinessDetailController {
  constructor(private readonly businessAccessService: BusinessAccessService) {}

  @Get()
  async show() {
    const business = await this.businessAccessService.validateAccess();

    const bu = await BusinessEntity.findOne({ where: { id: business.id }, relations: ['owner'] });
    if (!bu) throw new NotFoundException();

    return bu;
  }
}
