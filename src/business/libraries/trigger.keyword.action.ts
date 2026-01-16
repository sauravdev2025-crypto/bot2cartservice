import { ActionDetailsEntity } from '../entities/action.details.entity';
import { BroadcastMessageEntity } from '../entities/broadcast.message.entity';
import { KeywordActionDetailEntity } from '../entities/keyword.action.detail.entity';
import { KeywordActionTriggerDetailEntity } from '../entities/keyword.action.trigger.detail.entity';
import { KeywordDetailEntity } from '../entities/keyword.detail.entity';
import { ActionTypeEnum } from '../enums/action.type.enum';
import { KeywordMatchingTypeEnum } from '../enums/keyword.matching.type.enum';
import { TriggerAutomationActionService } from '../services/trigger.automation.action.service';

export class TriggerKeywordAction {
  protected bme: BroadcastMessageEntity;
  protected actions: KeywordActionDetailEntity[];

  constructor(protected readonly triggerAutomationService: TriggerAutomationActionService) {}

  async trigger(broadcast_message_id: BroadcastMessageEntity['id']) {
    await this.init(broadcast_message_id);

    const isValid = await this.validate();
    if (!isValid) return;

    await this.triggerAllActions();
  }

  async init(id: number) {
    const message = await BroadcastMessageEntity.first(id);
    if (!message?.is_replied) return;

    this.bme = message;
  }

  async validate() {
    if (!this.bme) return false;

    const keywordActions = await KeywordActionDetailEntity.find({
      where: { business_id: this.bme.business_id, active: true },
    });

    if (!keywordActions.length) return false;

    const message: string = this.bme.payload?.text?.body?.toLowerCase?.()?.trim?.();
    if (!message) return false;

    this.actions = keywordActions;
    return true;
  }

  async triggerAllActions() {
    for await (const action of this.actions) {
      await this.triggerOneAction(action?.id);
    }
  }

  async triggerOneAction(action_id: KeywordActionDetailEntity['id']) {
    const action = await KeywordActionDetailEntity.first(action_id, { relations: ['keyword', 'action'] });
    const keywords = action?.keyword?.keywords;

    if (!Array.isArray(keywords)) return;

    for (const keyword of keywords) {
      const isValid = await this.isValidKeyword(keyword?.toLowerCase(), action?.keyword);
      if (!isValid) continue;

      const response = await this.performActions(action?.action);
      if (response) await this.updateTrigger(action?.keyword_id, action);
    }
  }

  async performActions(ade: ActionDetailsEntity) {
    const actionType = ade?.type_id;

    if (actionType === ActionTypeEnum.ASSIGN_TO_USER) return this.triggerAutomationService.triggerAssignToUser(ade, this.bme.id);

    if (actionType === ActionTypeEnum.SEND_TEMPLATE_MESSAGE)
      return this.triggerAutomationService.sendTemplateMessage(ade?.parameters?.template_id, this.bme.id);

    if (actionType === ActionTypeEnum.SEND_IMAGE)
      return this.triggerAutomationService.sendImage(
        { link: ade?.parameters?.image_url, name: ade?.parameters?.attributes?.name, type: ade?.parameters?.attributes?.type },
        this.bme.id
      );

    if (actionType === ActionTypeEnum.TEXT) return this.triggerAutomationService.sendTextMessage(ade?.parameters?.message, this.bme.id);

    // if (actionType === ActionTypeEnum.SEND_DOCUMENT)
    //   return this.triggerAutomationService.sendDocument(ade?.parameters?.template_id, this.bme.id);
  }

  async updateTrigger(keywordId: number, action: KeywordActionDetailEntity) {
    const logs = KeywordActionTriggerDetailEntity.create({ business_id: this.bme.business_id, keyword_action_id: action.id });

    logs.is_success = true;
    logs.initiated_at = new Date();

    await logs.save();

    const keyword = await KeywordDetailEntity.first(keywordId);
    keyword.attributes = { ...keyword?.attributes, triggered: (keyword?.attributes?.triggered || 0) + 1 };
    return keyword.save();
  }

  async isValidKeyword(keyword: string, keywordEntity: KeywordDetailEntity) {
    const type_id = keywordEntity?.matching_type_id;

    const message: string = this.bme.payload?.text?.body?.toLowerCase?.()?.trim?.();
    if (!message) return;

    if (type_id === KeywordMatchingTypeEnum.EXACT) {
      if (message === keyword) return true;
    }

    if (type_id === KeywordMatchingTypeEnum.CONTAIN) {
      if (message?.toLowerCase().includes(keyword.toLowerCase())) return true;
    }

    if (type_id === KeywordMatchingTypeEnum.FUZZY) {
      const fuzzyPercentage = (keywordEntity?.attributes?.fuzzy_matching_rage || 80) / 100;
      const similarity = this.triggerAutomationService.calculateSimilarity(message.toLowerCase(), keyword.toLowerCase());
      return similarity >= fuzzyPercentage;
    }

    return false;
  }
}
