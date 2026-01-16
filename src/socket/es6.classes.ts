import { RoomPayloadDto } from './dtos/room.payload.dto';
import { MessageGateway } from './gateways/message.gateway';
import { BroadcastService } from './services/broadcast.service';

const es6Classes = {
  dtos: [RoomPayloadDto],
  gateways: [MessageGateway],
  services: [BroadcastService],
};

export default es6Classes;
