import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto } from '@servicelabsco/slabs-access-manager';
import { BroadcastMessageEntity } from '../../business/entities/broadcast.message.entity';
import { FacebookInternalMessageService } from '../../business/services/facebook.internal.message.service';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import {
  ExternalListMessagePayloadDto,
  SendExternalNormalMessagePayload,
  SendExternalTemplateMessagePayloadDto,
} from '../dtos/send.external.template.message.payload.dto';
import { ProcessSendExternalListMessage } from '../libraries/process.send.external.list.message';
import { ProcessSendExternalNormalMessage } from '../libraries/process.send.external.normal.message';
import { ProcessSendExternalTemplateMessage } from '../libraries/process.send.external.template.message';
import { ExternalAccessService } from '../services/external.access.service';
import { ExternalMessageService } from '../services/external.message.service';

/**
 * create controller for ExternalApiLog
 * @export
 * @class ExternalApiLogController
 */
@Controller('v1')
export class ExternalApiAsyncMessageController {
  constructor(
    protected readonly externalAccessService: ExternalAccessService,
    protected readonly externalMessageService: ExternalMessageService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService
  ) {}

  @Post('asyncSendTemplateMessage')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send template message',
    description: `
      Send WhatsApp template message asynchronously.
      
      **Documentation:**
      - [Message Guide](https://docs.finnoto.cloud/s/9d6ae162-63aa-4638-b633-34a2a687fb67)
    `,
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Successfully sent template message',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload or missing required fields',
  })
  async sendTemplateMessage(@Body() body: SendExternalTemplateMessagePayloadDto) {
    const business = await this.externalAccessService.validateAccess();
    return new ProcessSendExternalTemplateMessage(business, this.externalMessageService, this.businessMetaIntegrationService).send(body, true);
  }

  @Post('asyncSendMessage')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send normal message',
    description: `
      Send message asynchronously.
      
      **Documentation:**
      - [Message Guide](https://docs.finnoto.cloud/s/9d6ae162-63aa-4638-b633-34a2a687fb67)
    `,
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Successfully sent normal message',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload or missing required fields',
  })
  async sendWhatsappMessage(@Body() body: SendExternalNormalMessagePayload) {
    const business = await this.externalAccessService.validateAccess();
    if (!body.data && !body.attachment) throw new OperationException('Either data or attachment must be provided');

    return new ProcessSendExternalNormalMessage(business, this.externalMessageService).send(body, true);
  }

  @Post('asyncSendListMessage')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send list message',
    description: `
      Send list message asynchronously.
      **Documentation:**
      - [Message Guide](https://docs.finnoto.cloud/s/9d6ae162-63aa-4638-b633-34a2a687fb67)
    `,
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Successfully sent list message',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload or missing required fields',
  })
  async sendInteractiveMessage(@Body() body: ExternalListMessagePayloadDto) {
    const business = await this.externalAccessService.validateAccess();
    return new ProcessSendExternalListMessage(business, this.externalMessageService).send(body, true);
  }

  @Get('asyncMessage/:slug/status')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Get The overall status of message' })
  @ApiParam({
    name: 'slug',
    description: 'Async message UUID returned from send APIs',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'All webhook response for the message',
    schema: {
      oneOf: [
        { type: 'object', additionalProperties: true },
        { type: 'array', items: { type: 'object', additionalProperties: true } },
      ],
      description: 'Webhook response payload as stored',
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload or missing required fields',
  })
  async getMessageStatus(@Param() params: BusinessParamDto) {
    const business = await this.externalAccessService.validateAccess();
    const message = await BroadcastMessageEntity.findOne({ where: { business_id: business.id, uuid: params.slug } });
    if (!message) throw new OperationException('Invalid Id');

    return message?.webhook_response;
  }
}
