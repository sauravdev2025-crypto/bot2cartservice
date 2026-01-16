import { Get, Param, Req, Post, Body, Delete } from '@nestjs/common';
import {
  CommentService,
  Auth,
  AddCommentDto,
  SourceColumnDto,
  CommentEntity,
  AccessException,
  OperationException,
} from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto, ProductTypeEnum } from '@servicelabsco/slabs-access-manager';
import { CommentTypeEnum } from '../enums/comment.type.enum';
import { ProcessConversationData } from './process.conversation.data';
import { LocalCommentJob } from '../jobs/local.comment.job';

export class ConversationController {
  protected sourceType: string;
  protected parentValidator;
  protected readonly commentService: CommentService;
  protected readonly localCommentJob: LocalCommentJob;

  @Get(':id/conversations')
  async showConversations(@Param() params: BusinessParamDto, @Req() request: Request) {
    await this.checkAccess(params, request);

    const isVendorPortal = Auth.user().auth_attributes.product_id === ProductTypeEnum.VENDOR;
    if (isVendorPortal)
      return this.commentService.getComments({ source_id: params.id, source_type: this.sourceType, type_id: CommentTypeEnum.VENDOR });

    return this.commentService.getComments({ source_id: params.id, source_type: this.sourceType });
  }

  @Post(':id/conversation')
  async createConversation(@Param() params: BusinessParamDto, @Body() body: AddCommentDto) {
    await this.checkAccess(params);

    const source: SourceColumnDto = { source_id: params.id, source_type: this.sourceType };
    body.is_conversation = true;

    return new ProcessConversationData(source, this.commentService, this.localCommentJob).process(body);
  }

  @Delete(':id/conversation/second_id')
  async deleteConversation(@Param() params: BusinessParamDto) {
    await this.checkAccess(params);

    const user = Auth.user();
    const record = await CommentEntity.first(params.second_id);

    if (!record) throw new AccessException();

    if (record.created_by !== user.id) throw new OperationException(`Only creator can delete the record`);

    if (record.source_type !== this.sourceType || record.source_id !== params.id) throw new AccessException(`You don't have access to this record`);

    return record.softDelete();
  }

  protected checkAccess(params: BusinessParamDto, req?: Request) {
    return this.parentValidator(params.id, req);
  }
}
