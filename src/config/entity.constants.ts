import { BusinessEntity } from '../business/entities/business.entity';
import { BusinessSettingDetailEntity } from '../business/entities/business.setting.detail.entity';
import { BusinessTokenEntity } from '../business/entities/business.token.entity';
import { BusinessUserInvitationEntity } from '../business/entities/business.user.invitation.entity';
import { CommunicationApiAccountEntity } from '../business/entities/communication.api.account.entity';
import { CommunicationBusinessUserEntity } from '../business/entities/communication.business.user.entity';
import { ChatbotNodesEntity } from '../utility/entities/chatbot.nodes.entity';
import { CommunicationUserEntity } from '../utility/entities/communication.user.entity';
import { FacebookInternalLogEntity } from '../utility/entities/facebook.internal.log.entity';
import { IdentifierSerialEntity } from '../utility/entities/identifier.serial.entity';
import { SystemLanguageEntity } from '../utility/entities/system.language.entity';
import { UserActivityEntity } from '../utility/entities/user.activity.entity';

const entityConstants = {
  d6d2e31a0f603594295feb7db9d3d8d9: BusinessEntity,
  '76cbcfbb973bcc9ac0e22b641a63006e': BusinessSettingDetailEntity,
  '6c207c2c8be6023a5e7b5b7dabc6479e': BusinessTokenEntity,
  '1e05f92ed1eb1d7ef9f60a716a6a2b96': BusinessUserInvitationEntity,
  '1ebebe298cfcd7a5a61a1b022e59e653': CommunicationApiAccountEntity,
  '7dade7ccae76955b2f5ddbf3c031fdba': CommunicationBusinessUserEntity,
  a7f7cb3534e5e07df52431f4e43f0df5: ChatbotNodesEntity,
  a5e87fd873d7e20ddfda488fbba42689: CommunicationUserEntity,
  '467cbc8e6e907f72b76d038bb3b18b47': FacebookInternalLogEntity,
  '11afde96b8d9651290f23a2af66e4288': IdentifierSerialEntity,
  a41f8b9ae98d6b12add98e7e94bc514a: SystemLanguageEntity,
  '84f80e1fd52f55ff8540f908caf1a0fd': UserActivityEntity,
};

export = entityConstants;
