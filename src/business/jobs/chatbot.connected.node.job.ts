import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ChatbotConnectedNodeEntity } from '../entities/chatbot.connected.node.entity';

@Injectable()
export class ChatbotConnectedNodeJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('4d490ea643c69aeb283ff37ace70ac3b');
  }
  async handle(evt: DatabaseEventDto<ChatbotConnectedNodeEntity>) {
    return evt.entity;
  }
}
