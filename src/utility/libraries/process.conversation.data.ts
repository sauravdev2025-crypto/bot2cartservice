import { AddCommentDto, Auth, CommentEntity, CommentService, SourceColumnDto } from '@servicelabsco/nestjs-utility-services';
import { ProcessCommonData } from '@servicelabsco/slabs-access-manager';
import { LocalCommentJob } from '../jobs/local.comment.job';

import IdentifierMappings = require('../../config/identifier.mappings');

export class ProcessConversationData extends ProcessCommonData {
  protected payload: AddCommentDto;

  constructor(
    private readonly source: SourceColumnDto,
    private readonly commentService: CommentService,
    private readonly localCommentJob: LocalCommentJob
  ) {
    super();
  }

  async process(payload: AddCommentDto) {
    this.payload = payload;

    await this.validate();
    return this.set();
  }

  private async set() {
    const r = await this.commentService.setComment(this.payload, this.source);

    await this.setNotification(r);

    return r;
  }

  private async validate() {
    await this.validateParent();

    this.throwExceptionOnError();
  }

  private async validateParent() {
    if (!this.payload.parent_id) return;

    const parent = await CommentEntity.first(this.payload.parent_id);

    if (!parent) return this.setColumnError('parent_id', 'Invalid parent');

    if (parent.source_type !== this.source.source_type || parent.source_id !== this.source.source_id)
      return this.setColumnError('parent_id', 'Invalid parent');

    if (parent.parent_id) this.payload.parent_id = parent.parent_id;
  }

  private async setNotification(comment: CommentEntity) {
    const { business_id, product_id } = Auth.user().auth_attributes;

    const data = {
      business_id,
      comment,
      product_id,
    };

    await this.localCommentJob.dispatch(data);
  }
}
