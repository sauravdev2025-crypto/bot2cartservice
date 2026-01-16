export class FacebookSendTemplateMessageDto {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  parameter_format?: string;
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: Array<{
      type: string;
      parameters?: Array<{
        type: string;
        parameter_name?: string;
        text?: string;
      }>;
      sub_type?: string;
      index?: string;
    }>;
  };
  text?: {
    body?: string;
  };
}
