import { FacebookSendTemplateMessageDto } from '../dtos/facebook.send.template.message.dto';

export class ProcessSendTemplateMessage {
  protected payload: FacebookSendTemplateMessageDto;
  constructor() {}

  public async send(broadcast_id: number) {}
}
