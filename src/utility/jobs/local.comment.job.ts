import { Injectable } from '@nestjs/common';
import { CommentEntity, CommonJob, QueueService } from '@servicelabsco/nestjs-utility-services';
import { NotificationService, SlabsService } from '@servicelabsco/slabs-access-manager';
import { BusinessService } from '../services/business.service';
import SourceHash = require('../../config/source.hash');

@Injectable()
export class LocalCommentJob extends CommonJob {
  constructor(
    protected readonly queueService: QueueService,
    protected readonly notificationService: NotificationService,
    protected readonly businessService: BusinessService,
    protected readonly slabsService: SlabsService
  ) {
    super('d80f4527b9ab5f352f67362b8e3d348a');
  }

  async handle(data: { business_id: number; comment: CommentEntity; product_id: number }) {
    const { business_id: businessId, comment, product_id: productId } = data;
    if (!businessId || !comment.is_conversation || !productId) return;
    if (!comment.context) return;

    await this.handleUserNotificationCreation(businessId, comment, productId);
  }

  private async handleUserNotificationCreation(businessId: number, comment: CommentEntity, productId: number) {
    const context: object = comment.context;
    const userIds = [];
    let product_id = productId;

    for (const data of Object.values(context)) {
    }
  }
}
