import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { FacebookInternalMessageService } from '../services/facebook.internal.message.service';

@Injectable()
export class SendScheduledMessageJob extends CommonJob {
  protected priority = 15;
  protected noDuplicate = true;
  protected timeout = 10000;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService
  ) {
    super('68b02d2ee1074f29d5255e67be58e626');
  }
  async handle(id: number) {
    const message = await BroadcastMessageEntity.first(id);
    if (!message?.payload) return;
    return this.facebookInternalMessageService.sendQueueBroadcastMessage(message);
  }
}
