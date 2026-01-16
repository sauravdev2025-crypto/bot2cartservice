import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService, RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity } from '@servicelabsco/slabs-access-manager';
import { IsNull } from 'typeorm';
import SourceHash from '../../config/source.hash';
import { ChatbotNodesEntity } from '../../utility/entities/chatbot.nodes.entity';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { ChatbotConnectedNodeEntity } from '../entities/chatbot.connected.node.entity';
import { ChatbotDetailEntity } from '../entities/chatbot.detail.entity';
import { ChatbotFlowEntity } from '../entities/chatbot.flow.entity';
import { ContactEntity } from '../entities/contact.entity';
import { TeamInboxEntity } from '../entities/team.inbox.entity';
import { ChatbotNodesIdentifierConstants } from '../enums/chatbot.nodes.identifier.constants';
import { TeamInboxStatusTypeEnum } from '../enums/team.inbox.status.type.enum';
import { ProcessSetChatFlowNextStep } from '../libraries/process.set.chat.flow.next.step';
import { ProcessSetChatbotFlow } from '../libraries/process.set.chatbot.flow';
import { TriggerKeywordAction } from '../libraries/trigger.keyword.action';
import { ChatbotFlowService } from '../services/chatbot.flow.service';
import { FacebookInternalMessageService } from '../services/facebook.internal.message.service';
import { TeamInboxService } from '../services/team.inbox.service';
import { TriggerAutomationActionService } from '../services/trigger.automation.action.service';
import { WebhookService } from '../services/webhook.service';
import { BusinessWebhookEventTriggerJob } from './business.webhook.event.trigger.job';
import { SendPushNotificationJob } from './send.push.notification.job';
import { SyncBroadcastMessageStatsJob } from './sync.broadcast.message.stats.job';

@Injectable()
export class BroadcastMessageJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly webhookService: WebhookService,
    protected readonly businessWebhookEventTriggerJob: BusinessWebhookEventTriggerJob,
    protected readonly triggerAutomationService: TriggerAutomationActionService,
    protected readonly teamInboxService: TeamInboxService,
    protected readonly chatbotFlowService: ChatbotFlowService,
    protected readonly remoteRequestService: RemoteRequestService,
    private readonly sendPushNotificationJob: SendPushNotificationJob,
    protected readonly syncBroadcastMessageStatsJob: SyncBroadcastMessageStatsJob
  ) {
    super('16d90291137c2bd33db8ab43fd00bb1d');
  }

  async handle(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    // await this.triggerTeamInboxChatSocketJob.dispatch(evt);

    await this.reassignToNewAgentIfReplied(evt);
    await this.setLastActivityAt(evt);

    await this.handleKeywordActions(evt);
    await this.handleChatbotFlow(evt);
    await this.autoTriggerChatbot(evt);
    await this.syncStats(evt);

    await this.sendPushNotificationJob.dispatch(evt);

    return evt.entity;
  }

  async reassignToNewAgentIfReplied(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    if (!this.isNewRecord(evt)) return;
    if (evt.entity.is_replied) return;

    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(evt.entity.id);
    if (!teamInbox) return;

    if (!evt?.entity?.created_by) return;

    const bu = await BusinessUserEntity.findOne({
      where: { business_id: teamInbox?.business_id, user_id: evt?.entity?.created_by },
    });
    if (!bu) return;

    if (teamInbox?.assignee_id !== bu?.id) {
      teamInbox.assignee_id = bu?.id;
      await teamInbox.save();
    }

    if (teamInbox?.contact?.is_assigned_to_bot) {
      const contact = await ContactEntity.first(teamInbox.contact_id);
      contact.is_assigned_to_bot = false;
      await contact.save();
    }
  }

  async setLastActivityAt(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    if (!this.isColumnUpdated(evt, ['sent_at', 'is_error'])) return;
    if (evt.entity.is_error || !evt.entity.sent_at) return;

    const contact = await ContactEntity.findOne({ where: { mobile: evt.entity.mobile, business_id: evt.entity.business_id } });
    if (!contact) return;

    const teamInbox = await TeamInboxEntity.findOne({ where: { active: true, contact_id: contact.id, business_id: evt.entity.business_id } });
    if (!teamInbox) return;

    teamInbox.last_activity_at = new Date();

    if (evt.entity.is_replied) {
      teamInbox.attributes = { ...teamInbox?.attributes, reminder_sent: false };
      teamInbox.last_replied_at = new Date();
      teamInbox.expired_at = null;
      teamInbox.status_id = TeamInboxStatusTypeEnum.OPEN;
      teamInbox.only_broadcast = false;
    }

    if (teamInbox.expired_at) teamInbox.only_broadcast = true;

    return teamInbox.save();
  }

  async handleChatbotFlow(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    if (!this.isNewRecord(evt)) return;
    if (!evt?.entity.is_replied) return;

    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(evt.entity.id);
    if (!teamInbox) return;

    const chatbotFlow = await ChatbotFlowEntity.findOne({
      where: { business_id: evt.entity.business_id, team_inbox_id: teamInbox.id, active: true, end_time: IsNull() },
      relations: ['nest_step.node.node'],
    });

    if (!chatbotFlow) return;
    if (!chatbotFlow?.nest_step?.node?.node?.identifier?.includes('ask_question')) return;

    await new ProcessSetChatFlowNextStep(this.triggerAutomationService).setNextStep(evt.entity.payload, chatbotFlow.id);
  }

  async handleKeywordActions(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    if (!this.isNewRecord(evt)) return;
    if (!evt?.entity.is_replied) return;

    return new TriggerKeywordAction(this.triggerAutomationService).trigger(evt.entity.id);
  }

  async autoTriggerChatbot(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    if (!this.isNewRecord(evt) || !evt?.entity.is_replied) return;

    const [startNode, teamInbox] = await Promise.all([
      ChatbotNodesEntity.findOne({ where: { identifier: ChatbotNodesIdentifierConstants.start_node } }),
      this.teamInboxService.getTeamInboxFromBroadcastMessage(evt.entity.id),
    ]);

    if (!teamInbox) return;

    const message = evt.entity.payload?.text?.body?.toLowerCase().trim();
    const findChatbotStartingPoints = await ChatbotConnectedNodeEntity.find({
      where: { node_id: startNode.id, business_id: evt.entity.business_id, identifier: '1' },
      relations: ['chatbot_version'],
    });

    for await (const startingPoint of findChatbotStartingPoints) {
      const chatbot = await ChatbotDetailEntity.findOne({
        where: { version_id: startingPoint?.chatbot_version_id },
      });

      if (!chatbot) continue;

      const { keywords, rageValue: type_id, fuzzyMatchingRage = 80 } = startingPoint.payload?.data || {};
      if (!keywords?.length) continue;

      const isMatch = this.triggerAutomationService.matchKeyword(message, keywords, type_id, fuzzyMatchingRage);
      if (isMatch) {
        return new ProcessSetChatbotFlow().process(chatbot.version_id, teamInbox.id);
      }
    }
  }

  private async syncStats(evt: DatabaseEventDto<BroadcastMessageEntity>) {
    if (!this.isColumnUpdated(evt, ['initiated_at', 'sent_at', 'read_at', 'delivered_at', 'is_error'])) return;
    if (evt.entity.source_type !== SourceHash.ScheduleBroadcast) return;

    return this.syncBroadcastMessageStatsJob.dispatch(evt.entity.source_id, { delay: 30000 });
  }
}
