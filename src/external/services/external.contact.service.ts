import { Injectable } from '@nestjs/common';
import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity } from '@servicelabsco/slabs-access-manager';
import { AddContactDto } from '../../business/dtos/add.contact.dto';
import { BusinessEntity } from '../../business/entities/business.entity';
import { ContactEntity } from '../../business/entities/contact.entity';
import { ContactService } from '../../business/services/contact.service';
import { ExternalAddContactDto } from '../dtos/external.add.contact.dto';
import { WhatsappContactTransformerListConstant } from '../transformer_constant/whatsapp.contact.transformer.list.constant';
import { ExternalTransformerService } from './external.transformer.service';
import { ExternalBatchUpdateContactDto } from '../dtos/external.batch.update.contact.dto';

@Injectable()
export class ExternalContactService {
  constructor(
    protected readonly contactService: ContactService,
    protected readonly externalTransformerService: ExternalTransformerService
  ) {}

  async updateContact(contact_id: number, body: any) {
    const contact = await ContactEntity.findOne({ where: { id: contact_id }, relations: ['manager.user', 'business'] });

    const payload: AddContactDto = {
      custom_attributes: contact.custom_attributes,
      dialing_code: contact.dialing_code,
      mobile: contact.mobile,
      name: contact?.display_name,
      managed_by: contact?.managed_by,
      is_assigned_to_bot: contact?.is_assigned_to_bot,
      identifier: contact?.identifier,
      id: contact?.id,
    };

    Object.keys(body).forEach((_key) => {
      payload[_key] = body[_key];
    });

    if (body?.managed_by_email) {
      const businessUser = await BusinessUserEntity.findOne({
        where: { business_id: contact.business_id, user: { email: body.managed_by_email?.toLowerCase() } },
      });
      if (!businessUser) throw new OperationException('Invalid Manager Email');
      payload.managed_by = businessUser.id;
    }

    const setContact = await this.contactService.setContact(payload, contact.business);

    const data = await this.externalTransformerService.getTransformedData(
      { ...setContact, manager_email: body?.managed_by_email?.toLowerCase() },
      WhatsappContactTransformerListConstant
    );
    return data[0];
  }

  async setContact(body: ExternalAddContactDto, business: BusinessEntity) {
    const payload: AddContactDto = {
      custom_attributes: body.custom_attributes,
      dialing_code: body.dialing_code,
      mobile: body.mobile,
      name: body.name,
      identifier: body.identifier,
    };

    if (body?.managed_by_email) {
      const businessUser = await BusinessUserEntity.findOne({
        where: { business_id: business.id, user: { email: body.managed_by_email?.toLowerCase() } },
      });
      if (!businessUser) throw new OperationException('Invalid Manager Email');
      payload.managed_by = businessUser.id;
    }

    const setContact = await this.contactService.setContact(payload, business);
    const data = await this.externalTransformerService.getTransformedData(
      { ...setContact, manager_email: body?.managed_by_email?.toLowerCase() },
      WhatsappContactTransformerListConstant
    );
    return data[0];
  }

  async setBatchContacts(body: { contacts: ExternalAddContactDto[] }, business: BusinessEntity) {
    const results = [];
    const errors = [];

    for (const [index, contactData] of body.contacts.entries()) {
      try {
        const payload: AddContactDto = {
          custom_attributes: contactData.custom_attributes,
          dialing_code: contactData.dialing_code,
          mobile: contactData.mobile,
          name: contactData.name,
          identifier: contactData.identifier,
        };

        if (contactData?.managed_by_email) {
          const businessUser = await BusinessUserEntity.findOne({
            where: { business_id: business.id, user: { email: contactData.managed_by_email?.toLowerCase() } },
          });
          if (!businessUser) {
            errors.push({
              index,
              contact: contactData,
              error: 'Invalid Manager Email',
            });
            continue;
          }
          payload.managed_by = businessUser.id;
        }

        const setContact = await this.contactService.setContact(payload, business);
        const data = await this.externalTransformerService.getTransformedData(
          { ...setContact, manager_email: contactData?.managed_by_email?.toLowerCase() },
          WhatsappContactTransformerListConstant
        );

        results.push({
          index,
          contact: data[0],
          success: true,
        });
      } catch (error) {
        errors.push({
          index,
          contact: contactData,
          error: error.message || 'Failed to create contact',
        });
      }
    }

    return {
      success: results,
      errors,
      summary: {
        total: body.contacts.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  async updateBatchContacts(body: ExternalBatchUpdateContactDto, business: BusinessEntity) {
    const results = [];
    const errors = [];

    for (const [index, contactData] of body.contacts.entries()) {
      try {
        // Find the contact by wa_id and business_id
        const contact = await ContactEntity.findOne({
          where: { business_id: business.id, wa_id: contactData.wa_id },
          relations: ['manager.user', 'business'],
        });

        if (!contact) {
          errors.push({
            index,
            contact: contactData,
            error: `Contact with wa_id ${contactData.wa_id} not found`,
          });
          continue;
        }

        // Extract wa_id from contactData and create update payload
        const { wa_id, ...updateData } = contactData;

        // Update the contact
        const updatedContact = await this.updateContact(contact.id, updateData);

        results.push({
          index,
          contact: updatedContact,
          success: true,
        });
      } catch (error) {
        errors.push({
          index,
          contact: contactData,
          error: error.message || 'Failed to update contact',
        });
      }
    }

    return {
      success: results,
      errors,
      summary: {
        total: body.contacts.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }
}
