import { ChatbotNodesEntity } from '../../utility/entities/chatbot.nodes.entity';
import { ChatbotConnectedEdgesEntity } from '../entities/chatbot.connected.edges.entity';
import { ChatbotConnectedNodeEntity } from '../entities/chatbot.connected.node.entity';
import { ChatbotDetailEntity } from '../entities/chatbot.detail.entity';

export class ProcessSetRawChatbotDetailData {
  private chatbot: ChatbotDetailEntity;
  private rawJson: ChatbotDetailEntity['raw_react_flow'];

  constructor() {}

  public async process(chatbot_id: number) {
    await this.init(chatbot_id);

    await this.setNodes();
    await this.setEdges();

    return {
      success: true,
    };
  }

  private async init(chatbot_id: number) {
    const chatbot = await ChatbotDetailEntity.first(chatbot_id, { relations: ['version'] });

    this.rawJson = chatbot.raw_react_flow;
    this.chatbot = chatbot;
  }

  private async setNodes() {
    const nodes = this.rawJson.nodes;

    for await (const node of nodes) {
      const create = ChatbotConnectedNodeEntity.create({
        business_id: this.chatbot.business_id,
        chatbot_version_id: this.chatbot.version_id,
      });

      const systemNode = await ChatbotNodesEntity.findOne({ where: { identifier: node.type } });

      create.node_id = systemNode.id;
      create.identifier = node.id;

      create.payload = node;

      await create.save();
    }
  }

  private async setEdges() {
    const edges = this.rawJson.edges;

    for await (const edge of edges) {
      const node = await ChatbotConnectedNodeEntity.findOne({ where: { identifier: edge?.source, chatbot_version_id: this.chatbot.version_id } });
      const connectedNode = await ChatbotConnectedNodeEntity.findOne({
        where: { identifier: edge?.target, chatbot_version_id: this.chatbot.version_id },
      });

      const connectedEdges = ChatbotConnectedEdgesEntity.create({ chatbot_version_id: this.chatbot.version_id });

      connectedEdges.node_id = node.id;
      connectedEdges.connected_node_id = connectedNode.id;

      connectedEdges.edge_id = edge?.sourceHandle || edge.source;

      connectedEdges.payload = edge;

      await connectedEdges.save();
    }
  }
}
