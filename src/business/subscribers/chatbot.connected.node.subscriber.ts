import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ChatbotConnectedNodeEntity } from '../entities/chatbot.connected.node.entity';
import { ChatbotConnectedNodeJob } from '../jobs/chatbot.connected.node.job';

@EventSubscriber()
export class ChatbotConnectedNodeSubscriber extends CommonSubscriber<ChatbotConnectedNodeEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ChatbotConnectedNodeJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ChatbotConnectedNodeEntity;
  }
}
