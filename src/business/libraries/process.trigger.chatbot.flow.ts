import { RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import { addMinutes } from 'date-fns';
import { TemplateUtil } from '../../common/template.util';
import { ChatbotConnectedNodeEntity } from '../entities/chatbot.connected.node.entity';
import { ChatbotFlowEntity } from '../entities/chatbot.flow.entity';
import { ChatbotFlowStepEntity } from '../entities/chatbot.flow.step.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { ChatbotNodesIdentifierConstants } from '../enums/chatbot.nodes.identifier.constants';
import { TeamInboxService } from '../services/team.inbox.service';

export class ProcessTriggerChatbotFlow {
  protected variables: any;

  constructor(
    protected readonly teamInboxService: TeamInboxService,
    protected readonly remoteRequestService: RemoteRequestService
  ) {}

  async process(step_id: number) {
    const step = await ChatbotFlowStepEntity.first(step_id, { relations: ['node.node', 'flow'] });
    if (step?.end_time) return;

    await this.setVariable(step.flow_id);
    await this.triggerStepAction(step);
    await this.setTimeout(step);

    step.end_time = new Date();
    return step.save();
  }

  async setTimeout(step: ChatbotFlowStepEntity) {
    const timeout = step.node.payload?.data?.timeout;
    const chatbotFlow = await ChatbotFlowEntity.first(step.flow_id);

    chatbotFlow.node_expires_at = timeout ? addMinutes(new Date(), timeout) : null;
    await chatbotFlow.save();
  }

  async triggerStepAction(step: ChatbotFlowStepEntity) {
    const type = step.node.node.identifier;

    if (type === ChatbotNodesIdentifierConstants.ask_question) return this.sendListMessagePayload(step.flow.team_inbox_id, step.node);

    if (type === ChatbotNodesIdentifierConstants.ask_question_button) return this.sendButtonListMessage(step.flow.team_inbox_id, step.node);
    if (type === ChatbotNodesIdentifierConstants.ask_question_button_dynamic)
      return this.sendDynamicInteractiveButton(step.flow.team_inbox_id, step.node);

    if (type === ChatbotNodesIdentifierConstants.ask_question_list) return this.sendInteractiveList(step.flow.team_inbox_id, step.node);
    if (type === ChatbotNodesIdentifierConstants.ask_question_list_dynamic)
      return this.sendDynamicInteractiveList(step.flow.team_inbox_id, step.node);

    if (type === ChatbotNodesIdentifierConstants.send_message) return this.sendNormalMessage(step.flow.team_inbox_id, step.node);
    if (type === ChatbotNodesIdentifierConstants.dynamic_send_message) return this.sendDynamicNormalMessage(step.flow.team_inbox_id, step.node);

    if (type === ChatbotNodesIdentifierConstants.assign_user) return this.assignUser(step.flow.team_inbox_id, step.node);
    if (type === ChatbotNodesIdentifierConstants.end_node) return this.endChatFlow(step.flow_id);

    if (type === ChatbotNodesIdentifierConstants.set_condition) return;
    if (type === ChatbotNodesIdentifierConstants.dynamic_set_condition) return;

    if (type === ChatbotNodesIdentifierConstants.dynamic_api_request) return this.dynamicApiRequest(step.node);
    if (type === ChatbotNodesIdentifierConstants.set_time_delay) return this.setTimeDelay(step.node);
  }

  async setTimeDelay(node: ChatbotConnectedNodeEntity) {
    const delayInSeconds = node.payload?.data?.second || 20;
    await new Promise((resolve) => setTimeout(resolve, delayInSeconds * 1000));
  }

  async setVariable(flow_id: number) {
    const flow = await ChatbotFlowEntity.first(flow_id);
    const teamInbox = await TeamInboxEntity.first(flow.team_inbox_id, { relations: ['contact'] });

    const variables = {
      name: teamInbox?.contact?.name || teamInbox?.contact?.display_name,
      ...(flow?.variables || {}),
    };

    teamInbox.contact.custom_attributes?.forEach((att) => {
      variables[att.key] = att.value;
    });

    this.variables = variables;
  }

  async endChatFlow(flowId: number) {
    const flow = await ChatbotFlowEntity.first(flowId);

    flow.end_time = new Date();
    flow.active = false;

    return flow.save();
  }

  async assignUser(inboxId: number, node: ChatbotConnectedNodeEntity) {
    const teamInbox = await TeamInboxEntity.first(inboxId, { relations: ['contact'] });
    const buId = node.payload?.data?.id;

    teamInbox.assignee_id = buId;

    return teamInbox.save();
  }

  async sendNormalMessage(inboxId: number, node: ChatbotConnectedNodeEntity) {
    const messages = node.payload.data.data;

    for await (const message of messages) {
      if (message.type === 'message') {
        const body = this.insertVariableInBody(message.data.message);
        await this.teamInboxService.sendSimpleMessage(inboxId, { data: body });
      }

      if (['image', 'video'].includes(message.type))
        await this.teamInboxService.sendSimpleMessage(inboxId, {
          attachment: {
            link: message.data.document_url,
            name: message.data.attributes?.name,
            type: message.data.attributes?.type,
          },
        });
    }
  }

  async sendListMessagePayload(inboxId: number, node: ChatbotConnectedNodeEntity) {
    const { html, answer } = node.payload.data;

    const body = this.insertVariableInBody(html);
    const data = answer?.map((val, index) => `\n ${index + 1}. ${val?.text} ?`).join('') || '';

    return this.teamInboxService.sendSimpleMessage(inboxId, { data: `${body} ${data}` });
  }

  async sendButtonListMessage(inboxId: number, node: ChatbotConnectedNodeEntity) {
    const teamInbox = await TeamInboxEntity.first(inboxId, { relations: ['contact'] });
    const { html, answer, header, footer } = node.payload?.data || {};

    const body = this.insertVariableInBody(html);

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: teamInbox.contact.wa_id,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: body,
        },
        action: {
          buttons: answer?.map((_ans) => ({
            type: 'reply',
            reply: {
              id: _ans?.id,
              title: _ans?.text,
            },
          })),
        },
      },
    };

    if (header) {
      payload.interactive.header = {
        type: 'text',
        text: header,
      };
    }

    if (footer) {
      payload.interactive.footer = {
        text: footer,
      };
    }

    return this.teamInboxService.sendBotMessage(teamInbox, payload);
  }

  async sendInteractiveList(inboxId: number, node: ChatbotConnectedNodeEntity) {
    const teamInbox = await TeamInboxEntity.first(inboxId, { relations: ['contact'] });
    const { html, sections, header, footer, buttonName } = node.payload?.data || {};

    const body = this.insertVariableInBody(html);

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: teamInbox.contact.wa_id,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: body,
        },
        action: {
          sections: sections?.map((sec) => ({
            title: sec.title,
            rows: sec?.rows?.map((ro) => ({ id: ro.id, description: ro.description, title: ro.text })),
          })),
          button: buttonName,
        },
      },
    };

    if (header) {
      payload.interactive.header = {
        type: 'text',
        text: header,
      };
    }

    if (footer) {
      payload.interactive.footer = {
        text: footer,
      };
    }

    return this.teamInboxService.sendBotMessage(teamInbox, payload);
  }

  async sendDynamicInteractiveList(inboxId: number, node: ChatbotConnectedNodeEntity) {
    const dynamicNode = await this.setDynamicPayloadData(node);
    return this.sendInteractiveList(inboxId, dynamicNode);
  }

  async dynamicApiRequest(node: ChatbotConnectedNodeEntity) {
    const connectedNode = await ChatbotConnectedNodeEntity.first(node.id);
    const response = await this.getApiData(node.payload.data?.apiConfigScript);
    connectedNode.payload = { ...connectedNode?.payload, data: { ...connectedNode?.payload?.data, response } };
    return connectedNode.save();
  }

  async sendDynamicInteractiveButton(inboxId: number, node: ChatbotConnectedNodeEntity) {
    const dynamicNode = await this.setDynamicPayloadData(node);
    return this.sendButtonListMessage(inboxId, dynamicNode);
  }

  async sendDynamicNormalMessage(inboxId: number, node: ChatbotConnectedNodeEntity) {
    const connectedNode = await this.setDynamicPayloadData(node);
    return this.sendNormalMessage(inboxId, connectedNode);
  }

  async setDynamicPayloadData(node: ChatbotConnectedNodeEntity): Promise<ChatbotConnectedNodeEntity> {
    const connectedNode = await ChatbotConnectedNodeEntity.first(node.id);
    const globalVariables = this.variables;

    const response = await this.getApiData(node.payload.data?.apiConfigScript);

    let data: any;
    eval(node.payload.data?.dataScript);

    if (data?.messages) {
      connectedNode.payload = { ...connectedNode?.payload, data: { ...connectedNode?.payload?.data, data: data?.messages || data } };
    } else {
      connectedNode.payload = { ...connectedNode?.payload, data: { ...connectedNode?.payload?.data, ...data } };
    }
    return connectedNode.save();
  }

  async getApiData(script: any) {
    const apiConfig = this.getApiConfig(script);
    const options = {
      url: apiConfig?.url,
      method: apiConfig?.method,
      headers: {
        ...apiConfig?.headers,
      },
      data: apiConfig?.data,
    };
    const { data } = await this.remoteRequestService.getRawResponse(options);
    return data;
  }

  getApiConfig(script: string) {
    const globalVariables = this.variables;
    let apiConfig: any;
    eval(script);
    return apiConfig;
  }

  insertVariableInBody(html: string) {
    const body = TemplateUtil.convertBodyToWhatsappFormat(html);
    return TemplateUtil.replaceVariablesInStringNested(body, this.variables);
  }
}
