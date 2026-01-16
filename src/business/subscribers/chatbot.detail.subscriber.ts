import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ChatbotDetailEntity } from '../entities/chatbot.detail.entity';
import { ChatbotDetailJob } from '../jobs/chatbot.detail.job';

@EventSubscriber()
export class ChatbotDetailSubscriber extends CommonSubscriber<ChatbotDetailEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ChatbotDetailJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ChatbotDetailEntity;
  }
}
