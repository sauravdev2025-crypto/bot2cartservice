import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ChatbotNodesEntity } from '../entities/chatbot.nodes.entity';
import { ChatbotNodesJob } from '../jobs/chatbot.nodes.job';

@EventSubscriber()
export class ChatbotNodesSubscriber extends CommonSubscriber<ChatbotNodesEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ChatbotNodesJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ChatbotNodesEntity;
  }
}
