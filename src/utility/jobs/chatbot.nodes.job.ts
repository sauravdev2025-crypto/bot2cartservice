import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ChatbotNodesEntity } from '../entities/chatbot.nodes.entity';

@Injectable()
export class ChatbotNodesJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('91683000e9c936170050feb3d7c961a8');
  }
  async handle(evt: DatabaseEventDto<ChatbotNodesEntity>) {
    return evt.entity;
  }
}
