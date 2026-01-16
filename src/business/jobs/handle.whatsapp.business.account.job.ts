import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { FacebookInternalLogEntity } from '../../utility/entities/facebook.internal.log.entity';
import { BusinessService } from '../../utility/services/business.service';
import { FacebookWebhookEventDto, WhatsAppBusinessAccountChange } from '../dtos/facebook.webhook.event.dto';
import { BusinessEntity } from '../entities/business.entity';

@Injectable()
export class HandleWhatsappBusinessAccountJob extends CommonJob {
  protected priority: number = 2;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly businessService: BusinessService
  ) {
    super('2345d140d8c2660854849fd4cc7a8051');
  }

  async handle(rawData: FacebookWebhookEventDto) {
    this.logger.log(`[HandleWhatsAppBusinessAccountJob] Processing WhatsApp business account webhook`);

    for (const entry of rawData.entry || []) {
      for (const change of entry.changes || []) {
        if (this.isWhatsAppBusinessAccountChange(change)) {
          await this.routeAccountUpdate(change as WhatsAppBusinessAccountChange);
        }
      }
    }
    const changeTypes = Array.from(new Set(rawData.entry.flatMap((e) => e.changes?.map((c) => c.field) ?? [])));

    const log = FacebookInternalLogEntity.create({
      source_id: 9999,
      source_type: changeTypes.length ? `account-update:${changeTypes.join(',')}` : 'account-update',
      response: rawData,
    });

    await log.save();
  }

  private isWhatsAppBusinessAccountChange(change: any): boolean {
    return change.field === 'account_update' && change.value && typeof change.value.event === 'string';
  }

  private async routeAccountUpdate(change: WhatsAppBusinessAccountChange) {
    const { event } = change.value;

    this.logger.log(`[HandleWhatsAppBusinessAccountJob] Processing ${event}`);

    switch (event) {
      case 'PARTNER_REMOVED':
        await this.handlePartnerRemoved(change);
        break;
    }
  }

  private async handlePartnerRemoved(change: WhatsAppBusinessAccountChange) {
    const { value } = change || {};
    const { waba_info } = value;
    this.logger.log(`[HandleWhatsAppBusinessAccountJob] Handling partner removal for ${waba_info?.waba_id}`);

    // Find all businesses by phone number
    const businesses = await BusinessEntity.find({ where: { internal_id: waba_info?.waba_id } });

    if (!businesses || businesses.length === 0) {
      this.logger.warn(`[HandleWhatsAppBusinessAccountJob] No active businesses found for phone number ${waba_info?.waba_id}`);
      return;
    }

    // Deactivate and update all matching businesses
    for (const business of businesses) {
      const attributes = {
        partner_removed_at: new Date().toISOString(),
        partner_removal_reason: 'webhook_notification',
        last_account_update: {
          event: 'PARTNER_REMOVED',
          waba_info: waba_info,
          timestamp: new Date().toISOString(),
          webhook_data: change,
        },
      };

      await this.businessService.resetBusinessInfo(business?.id, attributes);
      this.logger.log(`[HandleWhatsAppBusinessAccountJob] Updated and deactivated business ${business.id} for partner removal`);
    }
  }
}
