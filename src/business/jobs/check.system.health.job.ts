import { Injectable } from '@nestjs/common';
import { CommonJob, PropertyService, QueueService, SqlService } from '@servicelabsco/nestjs-utility-services';
import { FacebookInternalMessageService } from '../services/facebook.internal.message.service';

@Injectable()
export class CheckSystemHealthJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly propertyService: PropertyService,
    protected readonly sqlService: SqlService
  ) {
    super('ada3a099d7d5c03c989e75a9347f9b04');
  }

  async handle() {
    const internal = await this.propertyService.get('inside.business.id');
    const mobiles = await this.propertyService.get('send.server.check.mobiles');
    if (!internal) return;

    const sql = `
      SELECT
        a.is_replied,
        COUNT(1) as count
      FROM
        bz_broadcast_messages a
      WHERE
        a.deleted_at IS NULL
        AND a.is_log = FALSE
        AND a.created_at >= NOW() - INTERVAL '60 minutes'
      GROUP BY a.is_replied
    `;

    const sqlResponse = await this.sqlService.read(sql);
    const business_id = +internal;
    const numbers = mobiles?.split(',');

    for await (const num of numbers) {
      await this.facebookInternalMessageService.sendTemplateMessage(
        { source_type: 'internal-check', source_id: 1 },
        {
          to: num,
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          type: 'text',
          text: {
            body: `System Health Check - 60 Minutes Stats\n\nTotal Messages Received: ${sqlResponse?.[1]?.count || 0}\nTotal Messages Sent: ${
              sqlResponse?.[0]?.count || 0
            }`,
          },
        },
        business_id
      );
    }
  }
}
