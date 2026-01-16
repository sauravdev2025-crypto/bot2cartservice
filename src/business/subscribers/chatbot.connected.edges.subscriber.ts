import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ChatbotConnectedEdgesEntity } from '../entities/chatbot.connected.edges.entity';
import { ChatbotConnectedEdgesJob } from '../jobs/chatbot.connected.edges.job';

@EventSubscriber()
export class ChatbotConnectedEdgesSubscriber extends CommonSubscriber<ChatbotConnectedEdgesEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ChatbotConnectedEdgesJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ChatbotConnectedEdgesEntity;
  }
}
