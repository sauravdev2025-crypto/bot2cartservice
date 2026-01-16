import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { SystemLanguageEntity } from '../../utility/entities/system.language.entity';
import { FileUploadService } from '../../utility/services/file.upload.service';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { WhatsappTemplateCategoryEnum } from '../enums/whatsapp.template.category.enum';
import { WhatsappTemplateStatusEnum } from '../enums/whatsapp.template.status.enum';
import { FacebookInternalTemplateService } from '../services/facebook.internal.template.service';

@Injectable()
export class ImportBusinessTemplateJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly facebookInternalTemplateService: FacebookInternalTemplateService,
    protected readonly fileUploadService: FileUploadService
  ) {
    super('af335fd11349fd06350bb2bfbf87ed50');
  }

  async handle({ ids, business_id }: { ids: string[]; business_id: number }) {
    const templates = await this.getTemplated(ids, business_id);
    if (!templates?.length) return;

    for (const template of templates) {
      const { id, ...otherTemplateData } = template;
      const newTemp = CommunicationWhatsappTemplateEntity.create();

      const language = await SystemLanguageEntity.findOne({ where: { code: otherTemplateData?.language } });

      newTemp.identifier = otherTemplateData.name;
      newTemp.name = otherTemplateData.name;
      newTemp.business_id = business_id;

      newTemp.language_id = language?.id;
      newTemp.category_id = this.getCategory(otherTemplateData?.category);
      newTemp.status_id = WhatsappTemplateStatusEnum.APPROVED;

      newTemp.template_config = otherTemplateData;

      const header = otherTemplateData?.components?.find((_component) => _component?.type === 'HEADER');
      const handle = header?.example?.header_handle?.[0];

      if (handle) {
        const newUrl = await this.fileUploadService.uploadFromUrl(handle);
        newTemp.attributes = {
          header_media_detail: {
            attributes: { name: `${otherTemplateData.name}-image`, type: 'unknown', size: 999 },
            document_url: newUrl,
          },
        };
      }

      await newTemp.save();
    }
  }

  getCategory(cat: string) {
    if (cat === 'UTILITY') return WhatsappTemplateCategoryEnum.UTILITY;
    if (cat === 'MARKETING') return WhatsappTemplateCategoryEnum.MARKETING;
    if (cat === 'AUTHENTICATION') return WhatsappTemplateCategoryEnum.AUTHENTICATION;
  }

  async getTemplated(ids: any[], business_id: number) {
    const businessTemplate = await this.facebookInternalTemplateService.getApprovedBusinessTemplate(business_id);
    return businessTemplate?.filter((data) => ids.includes(data?.id));
  }
}
