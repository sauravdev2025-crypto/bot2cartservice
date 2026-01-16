import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ChatbotFlowStepEntity } from '../entities/chatbot.flow.step.entity';
import { ProcessSetChatFlowNextStep } from '../libraries/process.set.chat.flow.next.step';
import { ChatbotFlowService } from '../services/chatbot.flow.service';
import { TriggerAutomationActionService } from '../services/trigger.automation.action.service';

@Injectable()
export class ChatbotFlowStepJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly chatbotFlowService: ChatbotFlowService,
    protected readonly triggerAutomationActionService: TriggerAutomationActionService
  ) {
    super('2ec166e2e859a04ffd62a0002565fb55');
  }
  async handle(evt: DatabaseEventDto<ChatbotFlowStepEntity>) {
    await this.triggerNextStep(evt);
    return evt.entity;
  }

  async triggerNextStep(evt: DatabaseEventDto<ChatbotFlowStepEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['end_time'])) return;

    if (!evt.entity.end_time) return;
    return new ProcessSetChatFlowNextStep(this.triggerAutomationActionService).setNextStep(null, evt.entity.flow_id);
  }
}
