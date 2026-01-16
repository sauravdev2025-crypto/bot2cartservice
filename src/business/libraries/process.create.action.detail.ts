import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity, ProcessCommonData } from '@servicelabsco/slabs-access-manager';
import { CreateActionDetailDto } from '../dtos/create.action.detail.dto';
import { ActionDetailsEntity } from '../entities/action.details.entity';
import { BusinessEntity } from '../entities/business.entity';
import { ChatbotDetailEntity } from '../entities/chatbot.detail.entity';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { ActionTypeEnum } from '../enums/action.type.enum';

export class ProcessCreateActionDetail extends ProcessCommonData {
  protected actionDetail: ActionDetailsEntity;
  protected payload: CreateActionDetailDto;

  constructor(protected readonly business: BusinessEntity) {
    super();
  }

  async process(payload: CreateActionDetailDto) {
    this.payload = payload;

    await this.init();
    await this.validate();

    return this.save();
  }

  async init() {
    let ad = ActionDetailsEntity.create({ business_id: this.business.id });
    if (this.payload.id) ad = await ActionDetailsEntity.first(this.payload.id);

    this.actionDetail = ad;
  }

  async validate() {}

  async save() {
    this.actionDetail.name = this.payload.name;
    this.actionDetail.type_id = this.payload.type_id;
    this.actionDetail.active = true;

    await this.assignParameter();

    return this.actionDetail.save();
  }

  async assignParameter() {
    if (this.payload.type_id === ActionTypeEnum.ASSIGN_TO_USER) return this.setAssignToParameters();
    if (this.payload.type_id === ActionTypeEnum.SEND_TEMPLATE_MESSAGE) return this.setTemplateParameter();
    if (this.payload.type_id === ActionTypeEnum.SEND_IMAGE) return this.setImageParameter();
    if (this.payload.type_id === ActionTypeEnum.TEXT) return this.setTextParameter();
    if (this.payload.type_id === ActionTypeEnum.CHATBOT) return this.setChatbotParameters();
  }

  async setTemplateParameter() {
    const template = await CommunicationWhatsappTemplateEntity.first(this.payload?.parameters?.template_id, {
      relations: ['language', 'category', 'status'],
    });

    this.actionDetail.parameters = {
      template_id: template?.id,
      name: template?.name,
      category: template?.category?.name,
      language: template?.language?.name,
    };
  }

  async setImageParameter() {
    this.actionDetail.parameters = this.payload?.parameters;
  }
  async setTextParameter() {
    this.actionDetail.parameters = this.payload?.parameters;
  }

  async setAssignToParameters() {
    const businessUser = await BusinessUserEntity.first(this.payload?.parameters?.user_id, { relations: ['user'] });
    if (!businessUser) throw new OperationException('error');

    this.actionDetail.parameters = {
      id: businessUser.id,
      user_id: businessUser?.user_id,
      user_name: businessUser?.user?.name,
      user_email: businessUser?.user?.email,
    };
  }
  async setChatbotParameters() {
    const chatbot = await ChatbotDetailEntity.first(this.payload?.parameters?.chatbot_id);
    if (!chatbot) throw new OperationException('error');

    this.actionDetail.parameters = {
      id: chatbot.id,
      name: chatbot.name,
    };
  }
}
