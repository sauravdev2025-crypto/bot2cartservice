import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { Equal, IsNull, LessThan } from 'typeorm';
import { ChatbotConnectedEdgesEntity } from '../entities/chatbot.connected.edges.entity';
import { ChatbotFlowEntity } from '../entities/chatbot.flow.entity';
import { ChatbotFlowStepEntity } from '../entities/chatbot.flow.step.entity';
import { ChatbotFlowService } from '../services/chatbot.flow.service';

@Injectable()
export class ChatbotFlowNextStepOnExpire extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly chatbotFlowService: ChatbotFlowService
  ) {
    super('89db76ca7a513b871646a74a4b9b3834');
  }

  async handle() {
    const flows = await ChatbotFlowEntity.find({ where: { active: true, end_time: IsNull(), node_expires_at: LessThan(new Date()) } });
    for (const flow of flows) {
      const chatbot = await ChatbotFlowEntity.first(flow.id, { relations: ['nest_step'] });
      const edge = await ChatbotConnectedEdgesEntity.findOne({
        where: { chatbot_version_id: chatbot.chatbot_version_id, node_id: chatbot.nest_step.node_id, edge_id: Equal('timeout') },
      });

      if (!edge?.connected_node_id) continue;
      await this.saveData(chatbot, edge.connected_node_id);
    }
  }

  async saveData(chatbot: ChatbotFlowEntity, connected_node_id: number) {
    const bot = await ChatbotFlowEntity.first(chatbot.id);

    const flowStep = ChatbotFlowStepEntity.create({ flow_id: chatbot.id, node_id: connected_node_id, start_time: new Date() });
    await flowStep.save();

    bot.next_step_id = flowStep.id;
    await bot.save();
  }
}
