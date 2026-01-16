import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class BroadcastService {
  /**
   * the actual socket io server initialization
   * @type {Server}
   * @memberof MessageGateway
   */
  @WebSocketServer() server: Server;

  /**
   * broadcast the data to the entire room participants
   * @param {string} room
   * @param {string} event
   * @param {*} data
   * @memberof MessageGateway
   */
  public async broadcastToRoom(room: string, event: string, data: any) {
    await this.server.to(room).emit(event, data);
  }

  public async newMessagedReceived(businessId: number, data: any) {
    const broadcastRoom = `business.${businessId}.event.broadcast`;

    await new Promise<void>((resolve, reject) => {
      this.server.to(broadcastRoom).emit('new_message_received', data, (ack: any) => {
        resolve();
      });
      // Optionally, you can add a timeout here to reject if no ack is received.
    });
  }

  public async updateMessageStatus(businessId: number, data: any) {
    const broadcastRoom = `business.${businessId}.event.broadcast`;
    await new Promise<void>((resolve, reject) => {
      this.server.to(broadcastRoom).emit('message_status_updated', data, (ack: any) => {
        // Log on successful send (acknowledgement received from client)
        console.log(`Successfully sent 'message_status_updated' to room ${broadcastRoom} with data:`, data);
        resolve();
      });
      // Optionally, you can add a timeout here to reject if no ack is received.
    });
  }
}
