import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber } from 'typeorm';
import { ChatbotFlowStepEntity } from '../entities/chatbot.flow.step.entity';
import { ChatbotFlowStepJob } from '../jobs/chatbot.flow.step.job';

@EventSubscriber()
export class ChatbotFlowStepSubscriber extends CommonSubscriber<ChatbotFlowStepEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: ChatbotFlowStepJob
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return ChatbotFlowStepEntity;
  }
}
