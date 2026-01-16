import { Injectable } from '@nestjs/common';
import { RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { BusinessAccessService } from './business.access.service';
import { FacebookInternalService } from './facebook.internal.service';
import { WhatsappTemplateCategoryEnum } from '../enums/whatsapp.template.category.enum';
import { SystemLanguageEntity } from '../../utility/entities/system.language.entity';

@Injectable()
export class FacebookInternalTemplateService {
  constructor(
    protected readonly facebookInternalService: FacebookInternalService,
    protected readonly businessAccessService: BusinessAccessService,
    protected readonly remoteRequestService: RemoteRequestService
  ) {}

  /**
   * Deletes a template from Facebook's system
   * @param template_id - The ID of the template to be deleted
   * @param business_id - The ID of the business associated with the template
   * @returns Promise resolving to the response from the deletion request
   * @example
   * const response = await deleteTemplate(123, 456);
   */
  public async deleteTemplate(template_id: number) {
    const template = await CommunicationWhatsappTemplateEntity.first(template_id);
    if (!template) return;

    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { access_token, internal_id } = await this.businessAccessService.getInternalProperties(template?.business_id);

    const options = {
      url: `${baseUrl}/${internal_id}/message_templates?name=${template?.identifier}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    };

    return this.remoteRequestService.getRawResponse(options);
  }

  async getBusinessTemplates(business_id: number) {
    const baseUrl = await this.facebookInternalService.getOfficialBaseUrl();
    const { internal_id, access_token } = await this.businessAccessService.getInternalProperties(business_id);

    if (!internal_id) return;

    const options = {
      url: `${baseUrl}/${internal_id}/message_templates`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    };

    const response = await this.remoteRequestService.getRawResponse(options);
    return response;
  }

  async getApprovedBusinessTemplate(business_id: number) {
    const templates = await this.getBusinessTemplates(business_id);
    return templates?.data?.data?.filter((temp) => temp?.status === 'APPROVED');
  }

  public getCategoryIdFromConfig(category: string) {
    const sanitizedCategory = category?.toUpperCase();

    if (sanitizedCategory === 'UTILITY') return WhatsappTemplateCategoryEnum.UTILITY;
    if (sanitizedCategory === 'MARKETING') return WhatsappTemplateCategoryEnum.MARKETING;
    if (sanitizedCategory === 'AUTHENTICATION') return WhatsappTemplateCategoryEnum.AUTHENTICATION;
  }

  async getLanguage(language_code: string) {
    return SystemLanguageEntity.findOne({ where: { code: language_code } });
  }
}
