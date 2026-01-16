import { ProcessCommonData } from '@servicelabsco/slabs-access-manager';
import { BusinessEntity } from '../entities/business.entity';
import { AddQuickReplyBodyDto } from '../dtos/add.quick.reply.body.dto';
import { QuickReplyEntity } from '../entities/quick.reply.entity';
import { OperationException } from '@servicelabsco/nestjs-utility-services';

export class ProcessCreateQuickReply extends ProcessCommonData {
  private body: AddQuickReplyBodyDto;
  private quickReply: QuickReplyEntity;

  constructor(protected readonly business: BusinessEntity) {
    super();
  }

  public async create(body: AddQuickReplyBodyDto) {
    this.body = body;

    await this.validate();
    return this.save();
  }

  private async save() {
    this.quickReply.name = this.body.name;
    this.quickReply.message = this.body.message;
    this.quickReply.document = this.body.document;

    this.quickReply.active = true;

    return this.quickReply.save();
  }

  private async validate() {
    let quickReply = QuickReplyEntity.create({ business_id: this.business.id });
    if (this.body.id) quickReply = await QuickReplyEntity.first(this.body.id);

    await this.validateShortCut();

    this.quickReply = quickReply;
    this.throwExceptionOnError();
  }

  private async validateShortCut() {
    if (!/^[a-zA-Z]+$/.test(this.body.shortcut)) this.setColumnError('shortcut', 'shortcut must only contain letters');

    const shortcut = await QuickReplyEntity.findOne({ where: { business_id: this.business.id, shortcut: this.body.shortcut } });
    if (shortcut) this.setColumnError('shortcut', 'duplicate shortcut not allowed');
  }
}
