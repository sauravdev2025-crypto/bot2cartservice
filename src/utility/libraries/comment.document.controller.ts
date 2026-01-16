import { Get, Param, Req, Post, Body, Delete, NotFoundException } from '@nestjs/common';
import {
  DocumentService,
  CommentService,
  Auth,
  CommentEntity,
  OperationException,
  AccessException,
  DocumentEntity,
  FileUploadDto,
} from '@servicelabsco/nestjs-utility-services';

import { CommentCreationDto } from '../dtos/comment.creation.dto';
import { ConversationController } from './conversation.controller';
import { BusinessParamDto, DocumentFileUploadDto, UtilityService } from '@servicelabsco/slabs-access-manager';
import { LocalCommentJob } from '../jobs/local.comment.job';

export class CommentDocumentController extends ConversationController {
  protected sourceType: string;
  protected parentValidator;
  protected type_id?: number;

  protected readonly documentService: DocumentService;
  protected readonly commentService: CommentService;
  protected readonly localCommentJob: LocalCommentJob;

  @Get(':id/comments')
  async getComments(@Param() params: BusinessParamDto, @Req() request: Request) {
    await this.checkAccess(params, request);

    const where = await this.getSource(params);

    return this.commentService.getComments({ ...where, is_conversation: false });
  }

  @Post(':id/comment')
  async setComments(@Param() params: BusinessParamDto, @Body() body: CommentCreationDto) {
    await this.checkAccess(params);

    const user = Auth.user();
    let record = CommentEntity.create({ source_type: this.sourceType, source_id: params.id });

    if (body.id) {
      record = await CommentEntity.first(body.id);

      if (record?.is_conversation) throw new OperationException('Conversation cannot be edited');

      if (record?.created_by !== user.id) throw new OperationException(`Only creator of the comment can update the comments`);
    }

    record.comments = body.comments;

    if (this.type_id) record.type_id = this.type_id;
    record.is_system_generated = false;

    return record.save();
  }

  @Delete(':id/comment/:second_id')
  async deleteComment(@Param() params: BusinessParamDto) {
    await this.checkAccess(params);

    const user = Auth.user();
    const record = await CommentEntity.first(params.second_id);

    if (!record) throw new AccessException();

    if (record.is_conversation) throw new OperationException('Conversation cannot be deleted');

    if (record.created_by !== user.id) throw new OperationException(`Only creator can delete the record`);

    if (record.source_type !== this.sourceType || record.source_id !== params.id) throw new AccessException(`You don't have access to this record`);

    return record.softDelete();
  }

  @Get(':id/documents')
  async getDocuments(@Param() params: BusinessParamDto, @Req() request: Request): Promise<any> {
    await this.checkAccess(params, request);
    const where = await this.getSource(params);

    return this.documentService.getDocuments(where);
  }

  @Post(':id/document')
  async createDocument(@Param() params: BusinessParamDto, @Body() body: DocumentFileUploadDto): Promise<DocumentEntity[]> {
    await this.checkAccess(params);
    const source = await this.getSource(params);

    if (this.type_id) {
      const r: FileUploadDto[] = [];

      for (const file of body.files) {
        r.push({ ...file, type_id: this.type_id });
      }

      body.files = r;
    }

    return this.documentService.setDocuments(source, body.files);
  }

  @Delete(':id/document/:account_id')
  async deleteDocument(@Param() params: BusinessParamDto) {
    await this.checkAccess(params);

    const document = await DocumentEntity.first(params.account_id);

    if (!document) throw new NotFoundException();

    if (!(document.source_type === this.sourceType && document.source_id === params.id)) throw new AccessException();

    const user = Auth.user();
    if (document.created_by !== user.id) throw new OperationException(`Only creator can delete the document`);

    return document.softDelete();
  }

  private async getSource(params: BusinessParamDto) {
    let where: any = { source_type: this.sourceType, source_id: params.id };

    const record = await UtilityService.getSourceData({ ...where });
    if (!record?.is_draft) if (this.type_id) where = { ...where, type_id: this.type_id };

    return where;
  }

  protected checkAccess(params: BusinessParamDto, req?: Request) {
    return this.parentValidator(params.id, req);
  }
}
