import { ActionDetailsEntity } from '../business/entities/action.details.entity';
import { BroadcastMessageEntity } from '../business/entities/broadcast.message.entity';
import { BusinessEntity } from '../business/entities/business.entity';
import { BusinessSettingDetailEntity } from '../business/entities/business.setting.detail.entity';
import { BusinessTokenEntity } from '../business/entities/business.token.entity';
import { BusinessUserInvitationEntity } from '../business/entities/business.user.invitation.entity';
import { ChatbotConnectedEdgesEntity } from '../business/entities/chatbot.connected.edges.entity';
import { ChatbotConnectedNodeEntity } from '../business/entities/chatbot.connected.node.entity';
import { ChatbotDetailEntity } from '../business/entities/chatbot.detail.entity';
import { ChatbotFlowEntity } from '../business/entities/chatbot.flow.entity';
import { ChatbotFlowStepEntity } from '../business/entities/chatbot.flow.step.entity';
import { ChatbotVersionEntity } from '../business/entities/chatbot.version.entity';
import { CommunicationApiAccountEntity } from '../business/entities/communication.api.account.entity';
import { CommunicationBusinessUserEntity } from '../business/entities/communication.business.user.entity';
import { CommunicationWhatsappTemplateEntity } from '../business/entities/communication.whatsapp.template.entity';
import { ContactEntity } from '../business/entities/contact.entity';
import { KeywordActionDetailEntity } from '../business/entities/keyword.action.detail.entity';
import { KeywordActionTriggerDetailEntity } from '../business/entities/keyword.action.trigger.detail.entity';
import { KeywordDetailEntity } from '../business/entities/keyword.detail.entity';
import { QuickReplyEntity } from '../business/entities/quick.reply.entity';
import { ScheduleBroadcastEntity } from '../business/entities/schedule.broadcast.entity';
import { TeamInboxEntity } from '../business/entities/team.inbox.entity';
import { ExternalApiLogEntity } from '../external/entities/external.api.log.entity';
import { ChatbotNodesEntity } from '../utility/entities/chatbot.nodes.entity';
import { CommunicationUserEntity } from '../utility/entities/communication.user.entity';
import { FacebookInternalLogEntity } from '../utility/entities/facebook.internal.log.entity';
import { IdentifierSerialEntity } from '../utility/entities/identifier.serial.entity';
import { SystemLanguageEntity } from '../utility/entities/system.language.entity';
import { UserActivityEntity } from '../utility/entities/user.activity.entity';

const entityConstants = {
  '91bf0828cc8320723d8514e310f1ea7b': ActionDetailsEntity,
  '42e317e631d68509a52453b4d0c97a1e': BroadcastMessageEntity,
  d6d2e31a0f603594295feb7db9d3d8d9: BusinessEntity,
  '76cbcfbb973bcc9ac0e22b641a63006e': BusinessSettingDetailEntity,
  '6c207c2c8be6023a5e7b5b7dabc6479e': BusinessTokenEntity,
  '1e05f92ed1eb1d7ef9f60a716a6a2b96': BusinessUserInvitationEntity,
  c8e7c32ac1dc3c8b6e472fcbc96754a5: ChatbotConnectedEdgesEntity,
  '58d2a88c283c5fd833610fce6fafc9f5': ChatbotConnectedNodeEntity,
  '921da9ee57967457c6ee5df6232a6763': ChatbotDetailEntity,
  b021df69348310773579bf6c672ebd0e: ChatbotFlowEntity,
  d3e2b5e6f4addc4b4c595e1bc575356d: ChatbotFlowStepEntity,
  '6473470627ed01dbfaa4933a9efb4f55': ChatbotVersionEntity,
  '1ebebe298cfcd7a5a61a1b022e59e653': CommunicationApiAccountEntity,
  '7dade7ccae76955b2f5ddbf3c031fdba': CommunicationBusinessUserEntity,
  bd7c0b90c33223c03ea69753017b971c: CommunicationWhatsappTemplateEntity,
  '1ab5358e7283476056e8a03463532691': ContactEntity,
  '8b9f5fb3bc14a4347850a7afa41f26c1': KeywordActionDetailEntity,
  '5a92a256d0d033e57bcc591baac0df17': KeywordActionTriggerDetailEntity,
  '04b7b29ce7a88b39e933af1b3bfb6be5': KeywordDetailEntity,
  ec8bd16331667146c2af8a1bc0362901: QuickReplyEntity,
  '440ad70ca5c4f7ea33fd6ebd4cdaa14f': ScheduleBroadcastEntity,
  d027e2b241e81ffae92c46116cb7eb4f: TeamInboxEntity,
  e544ee8d705777c2a5ae9abd4b77e23c: ExternalApiLogEntity,
  a7f7cb3534e5e07df52431f4e43f0df5: ChatbotNodesEntity,
  a5e87fd873d7e20ddfda488fbba42689: CommunicationUserEntity,
  '467cbc8e6e907f72b76d038bb3b18b47': FacebookInternalLogEntity,
  '11afde96b8d9651290f23a2af66e4288': IdentifierSerialEntity,
  a41f8b9ae98d6b12add98e7e94bc514a: SystemLanguageEntity,
  '84f80e1fd52f55ff8540f908caf1a0fd': UserActivityEntity,
};

export = entityConstants;
