import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { TemplateUtil } from '../../common/template.util';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { BroadcastMessagePayloadDto } from '../dtos/broadcast.message.payload.dto';
import { FacebookSendTemplateMessageDto } from '../dtos/facebook.send.template.message.dto';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { WhatsappTemplateCategoryEnum } from '../enums/whatsapp.template.category.enum';

/**
 * Class for creating broadcast message payloads for WhatsApp templates
 * @class CreateBroadcastMessagePayload
 * @description This class handles the creation of payloads for sending WhatsApp template messages
 */
export class CreateBroadcastMessagePayload {
  protected payload: FacebookSendTemplateMessageDto;
  protected data: BroadcastMessagePayloadDto;

  protected template: CommunicationWhatsappTemplateEntity;

  constructor(protected readonly businessMetaIntegrationService?: BusinessMetaIntegrationService) {}

  /**
   * Creates a WhatsApp template message payload
   * @param {BroadcastMessagePayloadDto} data - The data containing message details and variables
   * @returns {Promise<FacebookSendTemplateMessageDto>} The formatted WhatsApp template message payload
   * @example
   * const payload = await new CreateBroadcastMessagePayload().create(messageData);
   */
  public async create(data: BroadcastMessagePayloadDto): Promise<FacebookSendTemplateMessageDto> {
    await this.init(data);
    await this.processData();

    return this.payload;
  }

  /**
   * Processes the data and creates the WhatsApp template payload
   * @private
   */
  private async processData() {
    const _data = this.data;

    const payload: FacebookSendTemplateMessageDto = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: `${_data?.dialing_code}${_data?.mobile}`,
      type: 'template',
      parameter_format: 'NAMED',
      template: {
        name: this.template.name,
        language: {
          code: this.template.language.code,
        },
        components: await this.prepareComponent(),
      },
    };

    this.payload = payload;
  }

  /**
   * Prepares the components (header and body) for the template message
   * @private
   * @returns {Array} Array containing header and body components
   */
  private async prepareComponent() {
    if (this.template.category_id === WhatsappTemplateCategoryEnum.AUTHENTICATION) return this.getAuthPayload();

    const header = await this.getHeader();
    const body = this.getBody();
    const buttons = this.getButtonsConfig();

    return [...header, ...body, ...buttons];
  }

  private getAuthPayload() {
    const code = this.getValue('code');
    return [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: code,
          },
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          {
            type: 'text',
            text: code,
          },
        ],
      },
    ];
  }

  /**
   * Creates the body component with dynamic parameters
   * @private
   * @returns {Object} Body component object
   */
  private getBody() {
    const templateBody = this.template?.template_config?.components?.find((_component) => _component?.type === 'BODY');
    const body = TemplateUtil.getVariableParamsFromString(templateBody?.text);

    if (!body.length) return [];

    const uniqueVariables = [...new Set(body)];
    const duplicateVariables = this.getDuplicateParameters(body);

    const uniqueParameters = uniqueVariables.map((param) => {
      return {
        type: 'text',
        parameter_name: param,
        text: this.getValue(param),
      };
    });

    const duplicateParameters = duplicateVariables.map((param) => {
      return {
        type: 'text',
        parameter_name: param.parameter_name,
        text: param.text,
      };
    });

    const parameters = [...uniqueParameters, ...duplicateParameters];

    return [
      {
        type: 'body',
        parameters,
      },
    ];
  }

  private getDuplicateParameters(variables: string[]) {
    const hasSet = {};
    const duplicateVariables = [];

    let count = 1;
    for (const variable of variables) {
      if (hasSet[variable]) {
        duplicateVariables.push({
          parameter_name: `${variable}_dup${count}`,
          text: this.getValue(variable),
        });
        count++;
      }
      hasSet[variable] = true;
    }

    return duplicateVariables;
  }

  /**
   * Gets the button configurations for the template message
   * @private
   * @returns {Array} Array containing button components
   */
  private getButtonsConfig() {
    const template_buttons = this.template.template_config?.components?.find((_component) => _component?.type === 'BUTTONS');
    if (!template_buttons?.buttons?.length) return [];

    const quickReply = this.setQuickReplyButton(template_buttons?.buttons);
    const couponCode = this.setCouponCode(template_buttons?.buttons);

    return [...quickReply, ...couponCode];
  }

  /**
   * Creates quick reply button configurations from template settings
   * @returns {Array} Array of quick reply button objects
   * @example
   */
  private setQuickReplyButton(template_buttons: any[]) {
    const quickReply = template_buttons?.filter((_button) => _button?.type === 'QUICK_REPLY');
    if (!quickReply?.length) return [];

    return quickReply.map((val) => {
      const index = template_buttons.indexOf(val);
      return {
        type: 'button',
        sub_type: 'quick_reply',
        index: index.toString(),
        parameters: [
          {
            type: 'text',
            text: val?.text,
          },
        ],
      };
    });
  }

  private setCouponCode(template_buttons: any[]) {
    const coupon = template_buttons?.filter((_button) => _button?.type === 'COPY_CODE');
    if (!coupon?.length) return [];

    const coupon_code_data = this.data?.variables?.find((_var) => _var?.key === 'coupon_code');
    const index = template_buttons.indexOf(coupon?.[0]);

    return [
      {
        type: 'button',
        sub_type: 'COPY_CODE',
        index: index.toString(),
        parameters: [
          {
            type: 'coupon_code',
            coupon_code: coupon_code_data?.value || coupon?.[0]?.example,
          },
        ],
      },
    ];
  }

  /**
   * Creates the header component with dynamic parameters
   * @private
   * @returns {Object} Header component object
   */
  private async getHeader() {
    const header = this.template.template_config?.components?.find((_component) => _component?.type === 'HEADER');
    const media_id = header?.example?.header_handle?.[0];

    if (media_id) {
      const header_media_detail = this.template?.attributes?.header_media_detail;

      return [
        {
          type: 'header',
          parameters: [
            {
              type: header?.format?.toLowerCase(),
              [header?.format?.toLowerCase()]: {
                link: header_media_detail?.document_url,
              },
            },
          ],
        },
      ];
    }

    const templateHeader = TemplateUtil.getVariableParamsFromString(header?.text);
    if (!templateHeader?.length) return [];

    return [
      {
        type: 'header',
        parameters: templateHeader.map((param) => {
          return {
            type: 'text',
            parameter_name: param,
            text: this.getValue(param),
          };
        }),
      },
    ];
  }

  /**
   * Gets the value for a specific parameter from the message variables
   * @private
   * @param {string} param - The parameter name to get the value for
   * @returns {string} The parameter value
   */
  private getValue(param: string) {
    const entry = this.data.variables?.find((_data) => _data?.key === param);
    const value = entry?.value;

    const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

    if (isEmpty) {
      throw new OperationException(`Template variable "${param}" has empty value "${value ?? ''}"`);
    }

    return value;
  }
  /**
   * Initializes the class with data and fetches the template
   * @private
   * @param {BroadcastMessagePayloadDto} data - The message data
   */
  private async init(data: BroadcastMessagePayloadDto) {
    this.data = data;

    if (!this.data.dialing_code) throw new OperationException('Dialing Code should not be empty');
    if (!this.data.mobile) throw new OperationException('Mobile should not be empty');

    this.template = await CommunicationWhatsappTemplateEntity.first(this.data.id, { relations: ['language'] });
  }
}
