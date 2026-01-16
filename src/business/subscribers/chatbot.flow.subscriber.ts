import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ChatbotFlowEntity } from '../entities/chatbot.flow.entity';
import { ChatbotFlowJob } from '../jobs/chatbot.flow.job';

@EventSubscriber()
export class ChatbotFlowSubscriber extends CommonSubscriber<ChatbotFlowEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ChatbotFlowJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ChatbotFlowEntity;
  }
}
