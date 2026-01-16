import { Controller, MessageEvent, Param, Req, Sse } from '@nestjs/common';
import { BusinessParamDto } from '@servicelabsco/slabs-access-manager';
import { Observable } from 'rxjs';
import { BusinessAccessService } from '../services/business.access.service';
import { MessageGateway } from '../services/message.gateway';

@Controller('api/b/messages')
export class MessageController {
  constructor(
    private readonly gateway: MessageGateway,
    private readonly businessAccessService: BusinessAccessService
  ) {}

  @Sse('stream/:id')
  async sse(@Param() params: BusinessParamDto, @Req() req): Promise<Observable<MessageEvent>> {
    return this.gateway.subscribeToInbox(+params?.id);
  }
}
