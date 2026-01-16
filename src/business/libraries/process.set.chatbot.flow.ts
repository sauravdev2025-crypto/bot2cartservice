import { ChatbotConnectedEdgesEntity } from '../entities/chatbot.connected.edges.entity';
import { ChatbotConnectedNodeEntity } from '../entities/chatbot.connected.node.entity';
import { ChatbotFlowEntity } from '../entities/chatbot.flow.entity';
import { ChatbotFlowStepEntity } from '../entities/chatbot.flow.step.entity';
import { ChatbotVersionEntity } from '../entities/chatbot.version.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';

export class ProcessSetChatbotFlow {
  protected teamInbox: TeamInboxEntity;
  protected chatbotVersion: ChatbotVersionEntity;

  protected flow: ChatbotFlowEntity;
  constructor() {}

  public async process(chatbotVersionId: number, teamInboxId: number) {
    await this.init(chatbotVersionId, teamInboxId);

    await this.setChatbotFlow();
    const initialFlow = await this.setChatbotStep();

    this.flow.next_step_id = initialFlow.id;
    return this.flow.save();
  }

  private async init(chatbotVersionId: number, teamInboxId: number) {
    this.teamInbox = await TeamInboxEntity.first(teamInboxId);
    this.chatbotVersion = await ChatbotVersionEntity.first(chatbotVersionId, { relations: ['chatbot'] });
  }

  async setChatbotFlow() {
    const flow = ChatbotFlowEntity.create({ active: true, business_id: this.teamInbox.business_id });

    flow.team_inbox_id = this.teamInbox.id;
    flow.chatbot_version_id = this.chatbotVersion.id;
    flow.start_time = new Date();

    this.flow = await flow.save();
  }

  async setChatbotStep() {
    const initialNode = await this.getInitialStep();
    if (!initialNode) return;

    const flowStep = ChatbotFlowStepEntity.create({ flow_id: this.flow.id });

    flowStep.node_id = initialNode.id;
    flowStep.start_time = new Date();

    return flowStep.save();
  }

  async getInitialStep() {
    const node = await ChatbotConnectedNodeEntity.findOne({ where: { identifier: '1', chatbot_version_id: this.chatbotVersion?.id } });
    const initialEdges = await ChatbotConnectedEdgesEntity.findOne({
      where: { node_id: node.id, chatbot_version_id: this.chatbotVersion?.id },
      relations: ['connected_node'],
    });

    return initialEdges.connected_node;
  }
}
