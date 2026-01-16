// DTOs for the new webhook events
export interface BusinessAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface HistoryMessage {
  type: string;
  from: string;
  to: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  image?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  audio?: {
    mime_type: string;
    sha256: string;
    id: string;
  };
  document?: {
    caption?: string;
    filename: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  video?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  [key: string]: any; // For other message types
}

export interface HistorySyncData {
  messaging_product: string;
  metadata: BusinessAppMetadata;
  history: HistoryMessage[];
  messages?: HistoryMessage[];
}

export interface ContactSyncData {
  type: 'contact';
  contact: {
    full_name?: string;
    first_name?: string;
    phone_number: string;
  };
  action: 'add' | 'remove';
  metadata: {
    timestamp: string;
  };
}

export interface AppStateSyncData {
  messaging_product: string;
  metadata: BusinessAppMetadata;
  state_sync: ContactSyncData[];
}

export interface MessageEcho {
  from: string;
  to: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: any;
  audio?: any;
  document?: any;
  video?: any;
  [key: string]: any;
}

export interface MessageEchoData {
  messaging_product: string;
  metadata: BusinessAppMetadata;
  message_echoes: MessageEcho[];
}

export interface BusinessAppWebhookChange {
  value: HistorySyncData | AppStateSyncData | MessageEchoData;
  field: 'history' | 'smb_app_state_sync' | 'smb_message_echoes';
}

export interface BusinessAppWebhookEntry {
  id: string;
  changes: BusinessAppWebhookChange[];
}

export interface BusinessAppWebhookEventDto {
  object: string;
  entry: BusinessAppWebhookEntry[];
}

export class HandleFacebookBusinessAppSyncDto {}
