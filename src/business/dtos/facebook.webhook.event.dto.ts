export class MessageTemplateStatusUpdate {
  event: string;
  message_template_id: string;
  message_template_name: string;
  message_template_language: string;
  reason: string;
}

export class ChangeValue {
  event: 'APPROVED' | 'REJECTED' | 'PARTNER_ADDED' | 'PARTNER_APP_INSTALLED' | 'FLAGGED';
  message_template_id: number;
  message_template_name: string;
  message_template_language: string;
  reason: string;
  new_category: string;
}

export class Change {
  value: ChangeValue;
  field: 'template_category_update';
}

export class Entry {
  id: string;
  time: number;
  changes: Change[] | FaceBookMessageChangeDto[] | WhatsAppBusinessAccountChange[];
}

export class FacebookWebhookEventDto {
  entry: Entry[];
  object: string;
}

export class ConversationOrigin {
  type: string;
}

export class Conversation {
  id: string;
  expiration_timestamp: string;
  origin: ConversationOrigin;
}

export class Pricing {
  billable: boolean;
  pricing_model: string;
  category: string;
}

export class Status {
  id: string;
  status: 'sent' | 'read' | 'delivered' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation: Conversation;
  pricing: Pricing;
}

export class Metadata {
  display_phone_number: string;
  phone_number_id: string;
}

export class MessageValue {
  messaging_product: string;
  metadata: Metadata;
  statuses?: Status[];
  messages?: FacebookMessageRepliedDto[];
  contacts?: {
    profile: {
      name: string;
    };
    wa_id: string;
  }[];
}

export class FaceBookMessageChangeDto {
  value: MessageValue;
  field: string;
}
export class MessageContext {
  from: string;
  id: string;
}

export class MessageText {
  body: string;
}

export class FacebookMessageRepliedDto {
  context: MessageContext;
  from: string;
  id: string;
  timestamp: string;
  text: MessageText;
  type: string;
  system?: {
    body: string;
    wa_id: string;
    type: 'user_changed_number' | 'user_identity_changed' | 'user_phone_number_changed';
  };
}

export class WhatsAppBusinessAccountChangeValue {
  waba_info?: {
    owner_business_id: string;
    waba_id: string;
  };
  event: 'PARTNER_REMOVED' | 'PARTNER_ADDED' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_RESTORED';
}

export class WhatsAppBusinessAccountChange {
  value: WhatsAppBusinessAccountChangeValue;
  field: 'account_update';
}
