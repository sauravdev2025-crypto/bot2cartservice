import { Injectable } from '@nestjs/common';
import { CacheService, OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessPreferenceService, BusinessUserEntity } from '@servicelabsco/slabs-access-manager';
import { addDays } from 'date-fns';
import { AddContactDto } from '../dtos/add.contact.dto';
import { BusinessEntity } from '../entities/business.entity';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';

@Injectable()
export class ContactService {
  constructor(
    protected readonly businessPreferenceService: BusinessPreferenceService,
    protected readonly cacheService: CacheService
  ) {}

  async getContactFromCache(mobile: string, dialing_code: number, business_id: number) {
    const key = `business.contact.${mobile}.${dialing_code}.${business_id}`;
    const data = await this.cacheService.get(key);
    if (data) return data;

    const contact = await ContactEntity.findOne({
      where: { mobile: mobile, dialing_code: dialing_code, business_id: business_id },
    });

    if (!contact) return;

    await this.cacheService.set(key, contact, addDays(new Date(), 1));
    return contact;
  }
  async getInboxFromCache(contact_id: number) {
    const key = `business.contact.inbox.${contact_id}`;
    const data = await this.cacheService.get(key);
    if (data) return data;

    const inbox = await TeamInboxEntity.findOne({
      where: { contact_id },
    });
    if (!inbox) return;

    await this.cacheService.set(key, inbox, addDays(new Date(), 1));
    return inbox;
  }

  async setManager(contact_id: number, email: string) {
    const contact = await ContactEntity.first(contact_id);

    const bu = await BusinessUserEntity.findOne({ where: { business_id: contact.business_id, user: { email } } });
    if (!bu) throw new OperationException('No Manager exists with this email');

    contact.managed_by = bu.id;
    return contact.save();
  }

  async setContact(body: AddContactDto, business: BusinessEntity) {
    let contact = ContactEntity.create({ business_id: business.id });
    if (body?.id) contact = await ContactEntity.first(body.id);

    if (!body.id) {
      const find = await ContactEntity.findOne({ where: { business_id: business.id, dialing_code: body?.dialing_code, mobile: body?.mobile } });
      if (find) throw new OperationException('Duplicate Contact');
    }

    contact.dialing_code = body.dialing_code;
    contact.mobile = body.mobile;
    contact.is_assigned_to_bot = body?.is_assigned_to_bot;

    contact.display_name = body.name;
    if (!contact.name) contact.name = body.name;

    contact.custom_attributes = body.custom_attributes;
    contact.wa_id = `${body.dialing_code}${body.mobile}`;
    contact.managed_by = body?.managed_by;

    return contact.save();
  }

  async setInboxAssignee(contact_id: number, email: string) {
    const contact = await ContactEntity.first(contact_id);

    const teamInbox = await TeamInboxEntity.findOne({
      where: { contact_id: contact.id, business_id: contact.business_id },
      relations: ['status', 'contact', 'assignee.user'],
    });
    if (!teamInbox) throw new OperationException('The inbox has not been initialized yet');

    const bu = await BusinessUserEntity.findOne({ where: { business_id: contact.business_id, user: { email } } });
    if (!bu) throw new OperationException('No user exists with this email');

    const ti = await TeamInboxEntity.first(teamInbox.id);
    ti.assignee_id = bu.id;

    return ti.save();
  }

  async maskList(business_id: number, data: any) {
    const preference = await this.businessPreferenceService.getPreference(business_id, 'phone.masking.enabled', { enabled: false });
    if (!preference?.enabled) return data;

    return {
      ...data,
      records: data?.records.map((_con) => {
        return {
          ..._con,
          mobile: _con?.masked_phone || this.maskPhoneKeep2First3Last(_con?.mobile),
        };
      }),
    };
  }

  public maskPhoneKeep2First3Last(phone: string) {
    const digits = ('' + phone).replace(/\D/g, ''); // keep only digits
    if (digits.length <= 5) {
      // If number too short, just mask everything except last digit
      return '*'.repeat(Math.max(0, digits.length - 1)) + digits.slice(-1);
    }

    const first2 = digits.slice(0, 2);
    const last3 = digits.slice(-3);
    const maskedMiddle = '*'.repeat(digits.length - 5); // remaining middle digits

    return first2 + maskedMiddle + last3;
  }
}
