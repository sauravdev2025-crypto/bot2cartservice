import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { ChatbotConnectedEdgesEntity } from '../entities/chatbot.connected.edges.entity';
import { ChatbotDetailEntity } from '../entities/chatbot.detail.entity';
import { ChatbotVersionEntity } from '../entities/chatbot.version.entity';
import { ProcessSetRawChatbotDetailData } from '../libraries/process.set.raw.chatbot.detail.data';

@Injectable()
export class ChatbotDetailJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('a446afdb151bdfbfba8c3a9924d5e34c');
  }
  async handle(evt: DatabaseEventDto<ChatbotDetailEntity>) {
    await this.resetInternalPayloads(evt);
    await this.deleteAll(evt);

    return evt.entity;
  }

  async resetInternalPayloads(evt: DatabaseEventDto<ChatbotDetailEntity>) {
    if (this.isNewRecord(evt)) return;

    if (!this.isColumnUpdated(evt, ['version_id'])) return;
    if (!evt.entity.version_id) return;

    return new ProcessSetRawChatbotDetailData().process(evt.entity.id);
  }

  async deleteAll(evt: DatabaseEventDto<ChatbotDetailEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['deleted_at'])) return;

    if (!evt.entity.deleted_at) return;

    const versions = await ChatbotVersionEntity.find({ where: { chatbot_id: evt.entity.id } });

    for await (const version of versions) {
      const nodes = await ChatbotConnectedEdgesEntity.softDelete({ chatbot_version_id: version.id });
      const edges = await ChatbotConnectedEdgesEntity.softDelete({ chatbot_version_id: version.id });
      const v = await ChatbotVersionEntity.softDelete({ id: version.id });
    }
  }
}
