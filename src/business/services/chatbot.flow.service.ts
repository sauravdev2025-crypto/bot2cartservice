import { Injectable } from '@nestjs/common';
import { RemoteRequestService } from '@servicelabsco/nestjs-utility-services';
import { ProcessTriggerChatbotFlow } from '../libraries/process.trigger.chatbot.flow';
import { TeamInboxService } from './team.inbox.service';
import { TriggerAutomationActionService } from './trigger.automation.action.service';

@Injectable()
export class ChatbotFlowService {
  constructor(
    protected readonly teamInboxService: TeamInboxService,
    protected readonly triggerAutomationActionService: TriggerAutomationActionService,
    protected readonly remoteRequestService: RemoteRequestService
  ) {}

  async triggerStepAction(step_id: number) {
    try {
      return await new ProcessTriggerChatbotFlow(this.teamInboxService, this.remoteRequestService).process(step_id);
    } catch (error) {
      console.error('Error triggering step action:', error);
      throw error; // Rethrow the error if needed
    }
  }
}
