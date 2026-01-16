import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ChatbotConnectedEdgesEntity } from '../entities/chatbot.connected.edges.entity';

@Injectable()
export class ChatbotConnectedEdgesJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('1d4310d5e1f8a73a53ff32ee6b7ea5c7');
  }
  async handle(evt: DatabaseEventDto<ChatbotConnectedEdgesEntity>) {
    return evt.entity;
  }
}
