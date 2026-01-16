import { Injectable } from '@nestjs/common';
import { CommunicationWhatsappTemplateEntity } from '../../business/entities/communication.whatsapp.template.entity';
import { IdentifierSerialEntity } from '../entities/identifier.serial.entity';
import { IdentifierSerialsTypeEnum } from '../enums/identifier.serials.type.enum';
import { LookupValueEntity, PlatformUtility } from '@servicelabsco/nestjs-utility-services';

@Injectable()
export class IdentifierGeneratorService {
  async getTemplateIdentifier(entity: CommunicationWhatsappTemplateEntity): Promise<string> {
    const typeIdValue = await LookupValueEntity.first(IdentifierSerialsTypeEnum.TEMPLATE_IDENTIFIER);

    const name = entity.name;
    const sanitized_name = name.trim().replaceAll(' ', '_');

    let identifier: string;

    while (true) {
      const random = PlatformUtility.generateRandomAlpha(10, false);
      const data = `${sanitized_name}_${random}`.toLowerCase();

      const record = await IdentifierSerialEntity.findOne({ where: { value: data, prefix_id: typeIdValue.id } });

      if (!record) {
        const create = IdentifierSerialEntity.create({ value: data, prefix_id: typeIdValue.id });
        await create.save();

        identifier = `${typeIdValue.value}_${create.value}`;
        break;
      }
    }

    return identifier;
  }
}
