import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ChatbotVersionEntity } from '../entities/chatbot.version.entity';
import { ChatbotVersionJob } from '../jobs/chatbot.version.job';

@EventSubscriber()
export class ChatbotVersionSubscriber extends CommonSubscriber<ChatbotVersionEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ChatbotVersionJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ChatbotVersionEntity;
  }
}
