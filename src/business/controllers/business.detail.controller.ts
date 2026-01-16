import { Body, Controller, Get, NotFoundException, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto } from '@servicelabsco/slabs-access-manager';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { BusinessEntity } from '../entities/business.entity';
import { BusinessAccessService } from '../services/business.access.service';

@Controller('api/b/business-detail')
export class BusinessDetailController {
  constructor(
    private readonly businessAccessService: BusinessAccessService,
    private readonly businessMetaIntegrationService: BusinessMetaIntegrationService
  ) {}

  @Get()
  async show() {
    const business = await this.businessAccessService.validateAccess();

    const bu = await BusinessEntity.findOne({ where: { id: business.id }, relations: ['owner'] });
    if (!bu) throw new NotFoundException();

    return bu;
  }

  @Post(':id/register-number')
  async registerNumber(@Param() param: BusinessParamDto) {
    const business = await this.businessAccessService.validateAccess();
    const response = await this.businessMetaIntegrationService.registerPhoneNumber(`${param.id}`, business.id);

    if (!response?.data?.success) throw new OperationException(response.data);

    const bp = await BusinessEntity.first(business.id);
    bp.phone_registered_at = new Date();

    return bp.save();
  }

  // @todo- needs to remove and handle from the webhook
  @Get('get-wa-health')
  async getWaHealth() {
    const business = await this.businessAccessService.validateAccess();
    return this.businessMetaIntegrationService.syncBusinessInfo(business.id);
  }

  @Get('whatsapp-business-detail')
  async getWhatsappBusinessDetail() {
    const validation = await this.businessAccessService.validateAccess();
    const response = await this.businessMetaIntegrationService.getBusinessProfile(validation.id);
    if (!response) return response;

    const data = response.data?.data?.[0];

    if (data?.profile_picture_url && !validation?.attributes?.business_image) {
      validation.attributes = { ...validation?.attributes, business_image: data?.profile_picture_url };
      await validation?.save();
    }

    return response.data?.data?.[0];
  }

  // Start of Selection
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    const business = await this.businessAccessService.validateAccess();

    const uploadSession = await this.businessMetaIntegrationService.startUploadSession(file?.originalname, file.size, file?.mimetype, business.id);
    if (!uploadSession?.id) throw new NotFoundException('Failed to start upload session');

    // Step 2: Upload the file
    const uploadResponse = await this.businessMetaIntegrationService.uploadFile(uploadSession.id, file?.buffer, business.id);
    if (!uploadResponse?.h) throw new NotFoundException('Failed to upload file');

    return [{ message: 'File uploaded successfully', serverUrl: uploadResponse.h, id: uploadResponse.h }];
  }

  @Post('update-wa-detail')
  async updateWaProfile(@Body() body: any) {
    const validation = await this.businessAccessService.validateAccess();
    const response = await this.businessMetaIntegrationService.updateBusinessProfile(validation.id, body?.data);
    return response;
  }
}
