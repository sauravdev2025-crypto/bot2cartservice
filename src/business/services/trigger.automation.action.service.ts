import { Injectable } from '@nestjs/common';
import { SendTeamInboxSimpleMessagePayloadDto } from '../dtos/send.team.inbox.message.payload.dto';
import { ActionDetailsEntity } from '../entities/action.details.entity';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { KeywordMatchingTypeEnum } from '../enums/keyword.matching.type.enum';
import { ProcessSendTeamInboxMessage } from '../libraries/process.send.team.inbox.message';
import { TeamInboxService } from './team.inbox.service';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { FacebookInternalMessageService } from './facebook.internal.message.service';

@Injectable()
export class TriggerAutomationActionService {
  constructor(
    protected readonly teamInboxService: TeamInboxService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService
  ) {}

  async triggerAssignToUser(actionDetailsEntity: ActionDetailsEntity, broadcast_message_id: number) {
    const buId = actionDetailsEntity?.parameters?.id;
    if (!buId) return;

    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(broadcast_message_id);
    if (!teamInbox) return;

    if (teamInbox?.assignee_id === buId) return;

    teamInbox.assignee_id = buId;
    return teamInbox.save();
  }

  async sendTemplateMessage(template_id: number, broadcast_message_id: number) {
    const template = await CommunicationWhatsappTemplateEntity.first(template_id, { relations: ['business'] });
    if (!template) return;

    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(broadcast_message_id);
    if (!teamInbox) return;

    return new ProcessSendTeamInboxMessage(template?.business, this.businessMetaIntegrationService, this.facebookInternalMessageService).send({
      template_id: template?.id,
      contact_id: teamInbox?.contact_id,
      custom_attributes: {},
    });
  }

  async sendImage(options: SendTeamInboxSimpleMessagePayloadDto['attachment'], broadcast_message_id: number) {
    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(broadcast_message_id);
    if (!teamInbox) return;

    return this.teamInboxService.sendSimpleMessage(teamInbox.id, { attachment: options });
  }

  async sendTextMessage(message: SendTeamInboxSimpleMessagePayloadDto['data'], broadcast_message_id: number) {
    const teamInbox = await this.teamInboxService.getTeamInboxFromBroadcastMessage(broadcast_message_id);
    if (!teamInbox) return;
    return this.teamInboxService.sendSimpleMessage(teamInbox.id, { data: message });
  }

  public matchKeyword(message: string, keywords: string[], type_id: number, fuzzyMatchingRage: number): boolean {
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      switch (type_id) {
        case KeywordMatchingTypeEnum.EXACT:
          if (message === keywordLower) return true;
          break;

        case KeywordMatchingTypeEnum.CONTAIN:
          if (message.includes(keywordLower)) return true;
          break;

        case KeywordMatchingTypeEnum.FUZZY:
          const similarity = this.calculateSimilarity(message, keywordLower);
          if (similarity >= fuzzyMatchingRage / 100) return true;
          break;
      }
    }
    return false;
  }

  public calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1.0;

    const distance = this.levenshteinDistance(str1, str2);
    return (maxLen - distance) / maxLen;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return track[str2.length][str1.length];
  }
}
