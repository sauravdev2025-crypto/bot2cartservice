import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { IsNull, Not } from 'typeorm';
import { ChatbotFlowEntity } from '../entities/chatbot.flow.entity';
import { ChatbotFlowService } from '../services/chatbot.flow.service';

@Injectable()
export class ChatbotFlowJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly chatbotFlowService: ChatbotFlowService
  ) {
    super('45562c345f93db21f041c849221c3a9c');
  }
  async handle(evt: DatabaseEventDto<ChatbotFlowEntity>) {
    await this.disableOtherSession(evt);
    await this.triggerSteps(evt);
    return evt.entity;
  }

  async disableOtherSession(evt: DatabaseEventDto<ChatbotFlowEntity>) {
    if (!this.isNewRecord(evt)) return;

    const otherActiveFlows = await ChatbotFlowEntity.find({
      where: { business_id: evt.entity.business_id, team_inbox_id: evt.entity.team_inbox_id, end_time: IsNull(), id: Not(evt.entity.id) },
    });

    for await (const otherActiveFlow of otherActiveFlows) {
      const other = await ChatbotFlowEntity.first(otherActiveFlow.id);

      other.end_time = new Date();
      other.active = false;

      await other.save();
    }
  }

  async triggerSteps(evt: DatabaseEventDto<ChatbotFlowEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['next_step_id'])) return;

    if (!evt.entity.next_step_id) return;

    await this.chatbotFlowService.triggerStepAction(evt.entity.next_step_id);
  }
}
