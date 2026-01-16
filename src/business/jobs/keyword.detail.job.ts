import { Injectable } from '@nestjs/common';
import { CommonJob, DatabaseEventDto, QueueService } from '@servicelabsco/nestjs-utility-services';
import { KeywordActionDetailEntity } from '../entities/keyword.action.detail.entity';
import { KeywordDetailEntity } from '../entities/keyword.detail.entity';

@Injectable()
export class KeywordDetailJob extends CommonJob {
  constructor(protected readonly queueService: QueueService) {
    super('80429bf7a2b1dfa78a221d750b446c11');
  }
  async handle(evt: DatabaseEventDto<KeywordDetailEntity>) {
    await this.setAllActionState(evt);
    return evt.entity;
  }

  async setAllActionState(evt: DatabaseEventDto<KeywordDetailEntity>) {
    if (this.isNewRecord(evt)) return;
    if (!this.isColumnUpdated(evt, ['active'])) return;

    const actions = await KeywordActionDetailEntity.find({ where: { business_id: evt.entity?.business_id, keyword_id: evt.entity.id } });

    for await (const action of actions) {
      const act = await KeywordActionDetailEntity.first(action.id);
      act.active = evt.entity.active;

      await act.save();
    }
  }
}
