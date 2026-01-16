import { Injectable } from '@nestjs/common';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { MessageStatusEnum } from '../enums/message.status.enum';

@Injectable()
export class BroadcastMessageService {
  public getCurrentStatus(entity: BroadcastMessageEntity) {
    const { initiated_at, sent_at, delivered_at, read_at, is_error } = entity || {};

    if (is_error) return MessageStatusEnum.ERROR;
    if (read_at) return MessageStatusEnum.READ;
    if (delivered_at) return MessageStatusEnum.DELIVERED;
    if (sent_at) return MessageStatusEnum.SENT;
    if (initiated_at) return MessageStatusEnum.INITIATED;

    return MessageStatusEnum.UNKNOWN;
  }
}
