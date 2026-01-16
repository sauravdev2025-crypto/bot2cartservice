import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto } from '@servicelabsco/slabs-access-manager';
import { BusinessEntity } from '../../business/entities/business.entity';
import { ExternalApiAccountResponseDto } from '../dtos/external.api.account.response.dto';
import { ExternalBusinessResponseDto } from '../dtos/external.business.response.dto';
import { ExternalCreateBusinessDto } from '../dtos/external.create.business.dto';
import { GenerateClientSecretDto } from '../dtos/generate.client.secret.dto';
import { ExternalAccessService } from '../services/external.access.service';
import { ExternalPartnerService } from '../services/external.partner.service';
import { ExternalValidationUrlDto } from '../dtos/external.validation.url.dto';

/**
 * create controller for ExternalPartnerApiController
 * @export
 * @class ExternalPartnerApiController
 */
@ApiTags('v1/partner')
@Controller('v1/partner')
export class ExternalPartnerApiController {
  constructor(
    protected readonly externalAccessService: ExternalAccessService,
    protected readonly externalPartnerService: ExternalPartnerService
  ) {}

  @Get('test')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'test' })
  @ApiResponse({ status: 200, description: 'Hello partner!!' })
  async welcome() {
    await this.externalAccessService.validatePartnerAccess();
    return {
      message: 'Hello partner!!',
    };
  }

  @Get('business')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Businesses' })
  @ApiResponse({ status: 200, description: 'businesses retrieved successfully' })
  async getBusiness(): Promise<ExternalBusinessResponseDto[]> {
    const business = await this.externalAccessService.validatePartnerAccess();
    return this.externalPartnerService.getBusinesses(business.id);
  }

  @Get('business/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get business details by ID' })
  @ApiParam({ name: 'id', description: 'Business ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Business details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessById(@Param('id', ParseIntPipe) id: number): Promise<ExternalBusinessResponseDto> {
    await this.externalAccessService.validatePartnerAccess();
    return this.externalPartnerService.getBusinessById(id);
  }

  @Post('business')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new business for the partner' })
  @ApiResponse({ status: 201, description: 'Business created successfully', type: ExternalBusinessResponseDto })
  @ApiResponse({ status: 404, description: 'Partner business not found' })
  async createBusiness(@Body() createBusinessDto: ExternalCreateBusinessDto): Promise<ExternalBusinessResponseDto> {
    const partner = await this.externalAccessService.validatePartnerAccess();
    return this.externalPartnerService.createBusiness(createBusinessDto, partner);
  }

  @Post('business/:id/generate-secret')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new api secret for business' })
  @ApiResponse({ status: 201, description: 'secret created successfully', type: ExternalApiAccountResponseDto })
  @ApiResponse({ status: 404, description: 'Partner business not found' })
  async generateSecret(@Body() clientSecretDto: GenerateClientSecretDto, @Param() param: BusinessParamDto): Promise<ExternalApiAccountResponseDto> {
    const parent = await this.externalAccessService.validatePartnerAccess();
    const business = await BusinessEntity.first(param.id);
    if (business.parent_id !== parent.id) throw new OperationException('You dont have access to this business');

    return this.externalPartnerService.generateClientSecret(clientSecretDto, param.id);
  }

  @Get('business/:id/connect-business-url')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new connect business url' })
  @ApiResponse({ status: 201, description: 'Url generated successfully', type: ExternalValidationUrlDto })
  @ApiResponse({ status: 404, description: 'Partner business not found' })
  async generateValidationUrl(@Param() param: BusinessParamDto): Promise<ExternalValidationUrlDto> {
    const parent = await this.externalAccessService.validatePartnerAccess();

    const business = await BusinessEntity.first(param.id);
    if (business.parent_id !== parent.id) throw new OperationException('You dont have access to this business');

    return this.externalPartnerService.generateValidationUrl(parent, param.id);
  }
}
