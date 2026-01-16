import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { ListingService } from '@servicelabsco/slabs-access-manager';
import { ContactEntity } from '../../business/entities/contact.entity';
import { ProcessContactList } from '../../business/libraries/process.contact.list';
import { ProcessTeamInboxMessageList } from '../../business/libraries/process.team.inbox.message.list';
import { ContactService } from '../../business/services/contact.service';
import { FacebookInternalMessageService } from '../../business/services/facebook.internal.message.service';
import { ExternalContactInboxListFilterDto } from '../dtos/external.contact.inbox.list.filter.dto';
import { ExternalGetTemplatesListFilterDto } from '../dtos/external.get.templates.list.filter.dto';
import { ExternalSetContactDto } from '../dtos/external.set.contact.dto';
import { ExternalAccessService } from '../services/external.access.service';
import { ExternalMessageService } from '../services/external.message.service';
import { ExternalTransformerService } from '../services/external.transformer.service';
import { WhatsappContactTransformerListConstant } from '../transformer_constant/whatsapp.contact.transformer.list.constant';

import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClearConversationHistoryJob } from '../../business/jobs/clear.conversation.history.job';
import { ExternalAddContactDto } from '../dtos/external.add.contact.dto';
import { ExternalBatchAddContactDto } from '../dtos/external.batch.add.contact.dto';
import { ExternalBatchUpdateContactDto } from '../dtos/external.batch.update.contact.dto';
import { ExternalSetContactManagerParamsDto } from '../dtos/external.set.contact.manager.dto';
import { ExternalContactService } from '../services/external.contact.service';

@ApiTags('External Contact')
@ApiBearerAuth()
@Controller('v1/contact')
export class ExternalApiContactController {
  constructor(
    protected readonly externalAccessService: ExternalAccessService,
    protected readonly externalMessageService: ExternalMessageService,
    protected readonly facebookInternalMessageService: FacebookInternalMessageService,
    protected readonly listing_service: ListingService,
    protected readonly externalTransformerService: ExternalTransformerService,
    protected readonly contactService: ContactService,
    protected readonly externalContactService: ExternalContactService,
    protected readonly clearConversationHistoryJob: ClearConversationHistoryJob
  ) {}

  @ApiOperation({ summary: 'Get all contacts' })
  @ApiQuery({ type: ExternalGetTemplatesListFilterDto })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'List of contacts' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Get()
  async getAllContact(@Query() query: ExternalGetTemplatesListFilterDto) {
    const business = await this.externalAccessService.validateAccess();
    const contact = await new ProcessContactList(business, this.listing_service).process(query);
    return this.externalTransformerService.getListTransformedData(contact, WhatsappContactTransformerListConstant);
  }

  @ApiOperation({ summary: 'Create Contact' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Create Contact!!' })
  @ApiBody({ type: ExternalAddContactDto })
  @HttpCode(HttpStatus.ACCEPTED)
  @Post()
  async addContact(@Body() body: ExternalAddContactDto) {
    const business = await this.externalAccessService.validateAccess();
    return this.externalContactService.setContact(body, business);
  }

  @ApiOperation({ summary: 'Create Multiple Contacts (Batch)' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Batch Contact Creation Results',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number' },
              contact: { type: 'object' },
              success: { type: 'boolean' },
            },
          },
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number' },
              contact: { type: 'object' },
              error: { type: 'string' },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            successful: { type: 'number' },
            failed: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiBody({ type: ExternalBatchAddContactDto })
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('batch')
  async addBatchContacts(@Body() body: ExternalBatchAddContactDto) {
    const business = await this.externalAccessService.validateAccess();
    return this.externalContactService.setBatchContacts(body, business);
  }

  @ApiOperation({ summary: 'Update Multiple Contacts (Batch)' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Batch Contact Update Results',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number' },
              contact: { type: 'object' },
              success: { type: 'boolean' },
            },
          },
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number' },
              contact: { type: 'object' },
              error: { type: 'string' },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            successful: { type: 'number' },
            failed: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiBody({ type: ExternalBatchUpdateContactDto })
  @HttpCode(HttpStatus.ACCEPTED)
  @Patch('batch')
  async updateBatchContacts(@Body() body: ExternalBatchUpdateContactDto) {
    const business = await this.externalAccessService.validateAccess();
    return this.externalContactService.updateBatchContacts(body, business);
  }

  @ApiOperation({ summary: 'Get a contact by wa_id' })
  @ApiParam({ name: 'wa_id', type: String, description: 'WhatsApp ID of the contact' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Contact details' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Get(':wa_id')
  async getContact(@Param() param: ExternalSetContactManagerParamsDto) {
    const { contact } = await this.nestedValidation(param?.wa_id);

    const data = await this.externalTransformerService.getTransformedData(
      { ...contact, manager_email: contact?.manager?.user?.email },
      WhatsappContactTransformerListConstant
    );
    return data[0];
  }

  @ApiOperation({ summary: 'Update Contact' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Contact Updated!!' })
  @ApiParam({ name: 'wa_id', type: String, description: 'WhatsApp ID of the contact' })
  @ApiBody({ type: ExternalSetContactDto })
  @HttpCode(HttpStatus.ACCEPTED)
  @Patch(':wa_id')
  async updateContact(@Body() body: any, @Param() param: ExternalSetContactManagerParamsDto) {
    const { contact } = await this.nestedValidation(param?.wa_id);
    return this.externalContactService.updateContact(contact.id, body);
  }

  @ApiOperation({ summary: 'Get all messages for a contact' })
  @ApiParam({ name: 'wa_id', type: String, description: 'WhatsApp ID of the contact' })
  @ApiQuery({ type: ExternalContactInboxListFilterDto })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'List of messages for the contact' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Get(':wa_id/messages')
  async getAllContactMessages(@Query() query: ExternalContactInboxListFilterDto, @Param() param: ExternalSetContactManagerParamsDto) {
    const { business, contact } = await this.nestedValidation(param?.wa_id);
    return new ProcessTeamInboxMessageList(business, this.listing_service).process({ ...query, mobile: contact?.mobile } as any);
  }

  @ApiOperation({ summary: 'Clear conversation history for a contact' })
  @ApiParam({ name: 'wa_id', type: String, description: 'WhatsApp ID of the contact' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Conversation history will be deleted in the background. Request accepted and deletion will be performed asynchronously.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: {
          type: 'string',
          example: 'The request to clear conversation history has been received and messages will be deleted in the background.',
        },
        job_id: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':wa_id/conversation')
  async clearConversationHistory(@Param() param: ExternalSetContactManagerParamsDto) {
    const { contact } = await this.nestedValidation(param?.wa_id);
    const jobId = await this.clearConversationHistoryJob.dispatch(contact.id);

    return {
      success: true,
      message: 'The request to clear conversation history has been successfully received and is being processed.',
      job_id: jobId?.id,
    };
  }

  async nestedValidation(wa_id: string) {
    const business = await this.externalAccessService.validateAccess();
    const contact = await ContactEntity.findOne({ where: { business_id: business.id, wa_id }, relations: ['manager.user'] });
    if (!contact) throw new OperationException('No contact with this id matched');

    return { business, contact };
  }
}
