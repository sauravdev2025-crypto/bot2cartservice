import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ChatbotVersionEntity } from '../entities/chatbot.version.entity';

@Injectable()
export class ChatbotVersionJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('acc638242e0fde53e379ec4fa3c55eee');
  }
  async handle(evt: DatabaseEventDto<ChatbotVersionEntity>) {
    return evt.entity;
  }
}
