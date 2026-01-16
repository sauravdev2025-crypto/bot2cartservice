import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { AddApiAccountDto, ApiAccountEntity, BusinessParamDto } from '@servicelabsco/slabs-access-manager';
import { ExternalApiLogEntity } from '../../external/entities/external.api.log.entity';
import { CommunicationApiAccountEntity } from '../entities/communication.api.account.entity';
import { ProcessApiAccountData } from '../libraries/process.api.account.data';
import { BusinessAccessService } from '../services/business.access.service';

@Controller('api/b/client-secret')
export class ClientSecretConfigController {
  constructor(private readonly businessAccessService: BusinessAccessService) {}

  @Get()
  async getAll() {
    const business = await this.businessAccessService.validateAccess();
    return CommunicationApiAccountEntity.find({ where: { business_id: business.id } });
  }

  @Get('logs')
  async getLastLogs() {
    const business = await this.businessAccessService.validateAccess();
    return ExternalApiLogEntity.find({ where: { business_id: business.id }, take: 50, order: { created_at: 'DESC' }, relations: ['api_account'] });
  }

  @Post()
  async create(@Body() body: AddApiAccountDto) {
    const business = await this.businessAccessService.validateAccess();
    const existing = await CommunicationApiAccountEntity.find({
      where: { business_id: business.id },
    });

    if (existing?.length > 3) throw new OperationException('You cannot generate credentials more than 3');
    return new ProcessApiAccountData(business).process(body);
  }

  @Post(':id/activate')
  async activate(@Param() params: BusinessParamDto) {
    return this.handleContactStatus(true, params.id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param() params: BusinessParamDto) {
    return this.handleContactStatus(false, params.id);
  }

  async handleContactStatus(status: boolean, id: number) {
    const business = await this.businessAccessService.validateAccess();

    const r = await ApiAccountEntity.findOne({
      where: { id, business_id: business.id },
    });

    if (!r) throw new NotFoundException();

    if (status === r.active) throw new OperationException(`Invalid Operation`);
    r.active = status;

    return r.save();
  }
}
