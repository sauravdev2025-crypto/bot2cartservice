import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BusinessPreferenceEntity, BusinessPreferenceService } from '@servicelabsco/slabs-access-manager';
import { IsNull, Not } from 'typeorm';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { TeamInboxStatusTypeEnum } from '../enums/team.inbox.status.type.enum';
import { FacebookInternalMessageService } from '../services/facebook.internal.message.service';
import { TeamInboxService } from '../services/team.inbox.service';

@Injectable()
export class HandleAutoAssignToBotJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly businessPreferenceService: BusinessPreferenceService,
    protected readonly teamInboxService: TeamInboxService
  ) {
    super('b7ae7cc46053abe41f63e517d9e7154c');
  }
  async handle() {
    const businesses = await BusinessPreferenceEntity.find({ where: { business_id: Not(IsNull()), name: 'auto.assign.to.bot' } });

    for (const business of businesses) {
      const noReplyMin = business.preference?.no_reply;
      const activityMin = business.preference?.last_activity;

      const inboxes = await TeamInboxEntity.find({
        where: {
          business_id: business.business_id,
          expired_at: IsNull(),
          is_blocked: false,
          status_id: TeamInboxStatusTypeEnum.OPEN,
          contact: {
            is_assigned_to_bot: false,
            wa_id: Not(IsNull()),
          },
        },
        relations: ['contact'],
      });

      const now = Date.now();
      const thresholdDate = new Date(now - (noReplyMin || 120) * 60 * 1000);
      const thresholdLastDate = new Date(now - (activityMin || 120) * 60 * 1000);

      for (const inbox of inboxes) {
        const contact = inbox.contact;
        if (!contact) continue;

        const lastMessage = await BroadcastMessageEntity.findOne({
          where: { business_id: business.business_id, dialing_code: contact.dialing_code, mobile: contact.mobile },
          order: { created_at: 'DESC' },
        });

        let shouldAssign = false;

        if (lastMessage?.created_at && lastMessage.created_at < thresholdDate && lastMessage.is_replied) {
          shouldAssign = true;
        }

        if (inbox.last_activity_at && inbox.last_activity_at < thresholdLastDate) {
          shouldAssign = true;
        }

        if (shouldAssign) {
          contact.is_assigned_to_bot = true;

          await contact.save();
          await inbox.save();
        }
      }
    }
  }
}
