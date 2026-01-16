import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessParamDto } from '@servicelabsco/slabs-access-manager';
import { Response } from 'express';
import { FacebookInternalMessageService } from '../../business/services/facebook.internal.message.service';
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
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';

/**
 * create controller for ExternalApiLog
 * @export
 * @class ExternalApiLogController
 */
@Controller('v1')
export class ExternalApiMessageController {
  constructor(
    protected readonly externalAccessService: ExternalAccessService,
    protected readonly externalMessageService: ExternalMessageService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly businessMetaIntegrationService: BusinessMetaIntegrationService
  ) {}

  @Post('sendTemplateMessage')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send template message' })
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
    return new ProcessSendExternalTemplateMessage(business, this.externalMessageService, this.businessMetaIntegrationService).send(body);
  }

  @Post('sendMessage')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send normal message' })
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

    return new ProcessSendExternalNormalMessage(business, this.externalMessageService).send(body);
  }

  @Get(':slug/getDocument')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Get uploaded Document', deprecated: true })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Successful!!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload or missing required fields',
  })
  async getImage(@Param() params: BusinessParamDto, @Res() res: Response) {
    const business = await this.externalAccessService.validateAccess();
    const fileResponse = await this.facebookInternalMessageService.getDocumentFromId(params?.slug, business.id);
    if (!fileResponse) throw new OperationException('Error Getting the document');

    res.setHeader('Content-Type', fileResponse.headers['content-type']);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="internal_file".${this.facebookInternalMessageService.getFileExtension(fileResponse.headers['content-type'])}"`
    );

    fileResponse.data.pipe(res);
  }

  @Get('message/:slug/document')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Get uploaded Document' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Successful!!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload or missing required fields',
  })
  async getImageNew(@Param() params: BusinessParamDto, @Res() res: Response) {
    const business = await this.externalAccessService.validateAccess();
    const fileResponse = await this.facebookInternalMessageService.getDocumentFromId(params?.slug, business.id);
    if (!fileResponse) throw new OperationException('Error Getting the document');

    res.setHeader('Content-Type', fileResponse.headers['content-type']);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="internal_file".${this.facebookInternalMessageService.getFileExtension(fileResponse.headers['content-type'])}"`
    );

    fileResponse.data.pipe(res);
  }

  @Post('sendListMessage')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send list message' })
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
    return new ProcessSendExternalListMessage(business, this.externalMessageService).send(body);
  }
}
