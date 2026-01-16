import { ChatbotConnectedEdgesEntity } from '../entities/chatbot.connected.edges.entity';
import { ChatbotConnectedNodeEntity } from '../entities/chatbot.connected.node.entity';
import { ChatbotFlowEntity } from '../entities/chatbot.flow.entity';
import { ChatbotFlowStepEntity } from '../entities/chatbot.flow.step.entity';
import { ChatbotNodesIdentifierConstants } from '../enums/chatbot.nodes.identifier.constants';
import { TriggerAutomationActionService } from '../services/trigger.automation.action.service';

export class ProcessSetChatFlowNextStep {
  constructor(protected readonly triggerAutomationActionService: TriggerAutomationActionService) {}

  async setNextStep(messagePayload: any, chatbotFlowId: ChatbotFlowEntity['id']) {
    const flow = await ChatbotFlowEntity.first(chatbotFlowId, { relations: ['nest_step.node'] });
    const prevNode = flow?.nest_step?.node?.payload;

    if (prevNode.type === ChatbotNodesIdentifierConstants.ask_question) return this.handleNormalListResponse(messagePayload, flow);
    if (prevNode.type === ChatbotNodesIdentifierConstants.ask_question_button) return this.handleButtonListResponse(messagePayload, flow);
    if (prevNode.type === ChatbotNodesIdentifierConstants.ask_question_list) return this.handleListResponse(messagePayload, flow);
    if (prevNode.type === ChatbotNodesIdentifierConstants.ask_question_list_dynamic) return this.handleDynamicListResponse(messagePayload, flow);
    if (prevNode.type === ChatbotNodesIdentifierConstants.ask_question_button_dynamic) return this.handleDynamicButtonResponse(messagePayload, flow);
    if (prevNode.type === ChatbotNodesIdentifierConstants.set_condition) return this.handleSetCondition(flow);
    if (prevNode.type === ChatbotNodesIdentifierConstants.dynamic_set_condition) return this.handleSetConditionDynamic(flow);

    const nextConnectedNode = await ChatbotConnectedEdgesEntity.findOne({
      where: { edge_id: flow?.nest_step?.node?.identifier, chatbot_version_id: flow.chatbot_version_id },
    });
    return nextConnectedNode ? this.setChatbotStep(chatbotFlowId, nextConnectedNode.connected_node_id) : undefined;
  }

  private async handleSetCondition(flow: ChatbotFlowEntity) {
    const nextNode = await this.handleEvaluateCondition(flow.nest_step.node, flow.variables);
    return this.setChatbotStep(flow.id, nextNode);
  }
  private async handleSetConditionDynamic(flow: ChatbotFlowEntity) {
    const nextNode = await this.evaluateDynamicCondition(flow.nest_step.node, flow.variables);
    return this.setChatbotStep(flow.id, nextNode);
  }

  private async handleNormalListResponse(messagePayload: any, flow: ChatbotFlowEntity) {
    const message = messagePayload?.text?.body?.toLowerCase()?.trim();
    const prevNode = flow?.nest_step?.node?.payload;

    if (prevNode?.type === 'ask_question') {
      for (const ans of prevNode?.data?.answer) {
        if (this.triggerAutomationActionService.calculateSimilarity(ans?.text?.toLowerCase()?.trim(), message) >= 0.8) {
          const edge = await ChatbotConnectedEdgesEntity.findOne({ where: { edge_id: ans.id, chatbot_version_id: flow.chatbot_version_id } });
          if (edge) {
            const variable = prevNode?.data?.variableName;
            if (variable) await this.setVariable(flow.id, variable, message);
            return this.setChatbotStep(flow.id, edge.connected_node_id);
          }
        }
      }
    }
  }

  private async handleButtonListResponse(messagePayload: any, flow: ChatbotFlowEntity) {
    const messageId = messagePayload?.interactive?.button_reply?.id;
    const prevNode = flow?.nest_step?.node?.payload;

    for (const ans of prevNode?.data?.answer) {
      if (messageId === ans.id) {
        const edge = await ChatbotConnectedEdgesEntity.findOne({ where: { edge_id: ans.id, chatbot_version_id: flow.chatbot_version_id } });
        if (edge) {
          const variable = prevNode?.data?.variableName;
          if (variable) await this.setVariable(flow.id, variable, ans.text);
          return this.setChatbotStep(flow.id, edge.connected_node_id);
        }
      }
    }
  }

  private async handleListResponse(messagePayload: any, flow: ChatbotFlowEntity) {
    const message = messagePayload?.interactive?.list_reply;
    const prevNode = flow?.nest_step?.node?.payload;

    for (const section of prevNode?.data?.sections) {
      for (const row of section?.rows) {
        if (row?.text?.toLowerCase() === message?.title?.toLowerCase()) {
          const edge = await ChatbotConnectedEdgesEntity.findOne({ where: { edge_id: row.id, chatbot_version_id: flow.chatbot_version_id } });
          if (edge) {
            const variable = prevNode?.data?.variableName;
            if (variable) await this.setVariable(flow.id, variable, row?.text);
            return this.setChatbotStep(flow.id, edge.connected_node_id);
          }
        }
      }
    }
  }
  private async handleDynamicListResponse(messagePayload: any, flow: ChatbotFlowEntity) {
    const message = messagePayload?.interactive?.list_reply;
    const prevNode = flow?.nest_step?.node?.payload;

    for (const section of prevNode?.data?.sections) {
      for (const row of section?.rows) {
        if (row?.text?.toLowerCase() === message?.title?.toLowerCase()) {
          const nextConnectedNode = await ChatbotConnectedEdgesEntity.findOne({
            where: { edge_id: flow?.nest_step?.node?.identifier, chatbot_version_id: flow.chatbot_version_id },
          });
          if (nextConnectedNode) {
            const variable = prevNode?.data?.variableName;
            if (variable) await this.setVariable(flow.id, variable, row);
            return this.setChatbotStep(flow.id, nextConnectedNode.connected_node_id);
          }
        }
      }
    }
  }
  private async handleDynamicButtonResponse(messagePayload: any, flow: ChatbotFlowEntity) {
    const messageId = messagePayload?.interactive?.button_reply?.id;
    const prevNode = flow?.nest_step?.node?.payload;

    for (const ans of prevNode?.data?.answer) {
      if (String(messageId) === String(ans.id)) {
        const nextConnectedNode = await ChatbotConnectedEdgesEntity.findOne({
          where: { edge_id: flow?.nest_step?.node?.identifier, chatbot_version_id: flow.chatbot_version_id },
        });
        if (nextConnectedNode) {
          const variable = prevNode?.data?.variableName;
          if (variable) await this.setVariable(flow.id, variable, ans);
          return this.setChatbotStep(flow.id, nextConnectedNode.connected_node_id);
        }
      }
    }
  }

  private async setChatbotStep(flowId: number, nodeId: number) {
    const flowStep = ChatbotFlowStepEntity.create({ flow_id: flowId, node_id: nodeId, start_time: new Date() });
    await flowStep.save();

    const chatbotFlow = await ChatbotFlowEntity.first(flowId);
    chatbotFlow.next_step_id = flowStep.id;
    await chatbotFlow.save();

    return flowStep;
  }

  async setVariable(flowId: number, variableName: string, variableValue: any) {
    const flow = await ChatbotFlowEntity.first(flowId);
    if (!flow) return;

    flow.variables = { ...flow.variables, [variableName]: variableValue };
    return flow.save();
  }

  async getNextConnectedNode(isTrue: boolean, nodeId: number) {
    const data = await ChatbotConnectedNodeEntity.first(nodeId);

    const connectedEdge = await ChatbotConnectedEdgesEntity.find({ where: { node_id: nodeId, chatbot_version_id: data.chatbot_version_id } });
    const nextEdge = connectedEdge.find((val) => val?.edge_id.includes(isTrue ? 'condition-true' : 'condition-false'));

    data.payload = { ...data.payload, nextEdgeId: nextEdge.id };

    await data.save();
    return nextEdge.connected_node_id;
  }

  async evaluateDynamicCondition(node: ChatbotConnectedNodeEntity, variables: any) {
    const globalVariables = variables;
    let condition: any;

    eval(node.payload.data?.dataScript);
    const isTrue = condition === 'true';

    return this.getNextConnectedNode(isTrue, node.id);
  }

  async handleEvaluateCondition(node: ChatbotConnectedNodeEntity, variables: any) {
    const isTrue = this.evaluateCondition(node, variables);
    return this.getNextConnectedNode(isTrue, node.id);
  }

  private evaluateCondition(node: ChatbotConnectedNodeEntity, variables: any) {
    const conditionOneResult = this.handleMainCondition(node.payload?.data?.data?.condition?.[0], variables);

    const conditionTwo = node.payload?.data?.data?.condition?.[1];

    if (!conditionTwo) return conditionOneResult;
    const conditionTwoResult = this.handleMainCondition(conditionTwo, variables);

    const mainOperator = node.payload?.data?.data?.operator;

    if (mainOperator === 'AND') return conditionOneResult === conditionTwoResult;
    if (mainOperator === 'OR') return conditionOneResult || conditionTwoResult;
  }

  private handleMainCondition(evaluator: any, variables: any) {
    let isTrue: boolean;

    const condition = evaluator;
    if (condition?.is_second_variable) {
      isTrue = this.handleCondition(condition.operator, variables[condition?.first_value], variables[condition?.second_value]);
    } else {
      isTrue = this.handleCondition(condition.operator, variables[condition?.first_value], condition?.second_value);
    }

    return isTrue;
  }

  private handleCondition(operator: string, first_value: any, secondValue: any) {
    switch (operator) {
      case 'equal':
        return first_value === secondValue;
      case 'not_equal':
        return first_value !== secondValue;
      case 'contains':
        return String(first_value).includes(String(secondValue));
      case 'does_not_contain':
        return !String(first_value).includes(String(secondValue));
      case 'starts_with':
        return String(first_value).startsWith(String(secondValue));
      case 'does_not_start_with':
        return !String(first_value).startsWith(String(secondValue));
      default:
        return false;
    }
  }
}
