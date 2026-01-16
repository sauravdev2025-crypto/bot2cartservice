import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthService } from '@servicelabsco/nestjs-utility-services';
import { Server, Socket } from 'socket.io';

/**
 * setting up the message gateway
 * @export
 * @class MessageGateway
 */
@WebSocketGateway()
export class MessageGateway {
  /**
   * Creates an instance of MessageGateway.
   * @param {AuthService} authService
   * @memberof MessageGateway
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * the actual socket io server initialization
   * @type {Server}
   * @memberof MessageGateway
   */
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('MessageGateway');

  /**
   * validate the socket with the user token
   * @param {Socket} client
   * @param {*} payload
   * @return {*}
   * @memberof MessageGateway
   */
  @SubscribeMessage('login')
  public async validateLogin(client: Socket, payload: any) {
    const data = await this.authService.verifyJwtToken(payload.token);
    if (!data) return client.emit('invalid_login', payload);

    const user = await this.authService.getUserObject(data.id);
    (client as any).u_logged_user = user;

    client.emit('user_on_login', user);
    client.join(`user_room-${user.id}`);

    const businessId = data?.auth_attributes?.business_id;
    if (businessId) {
      client.join(`business.${businessId}.event.broadcast`);
    }

    // automatically connect the device with the given user
    if (payload.u_device_identifier) {
      (client as any).u_device_identifier = payload.u_device_identifier;
      client.join(payload.u_device_identifier);
    }

    return this.logger.log(`Client connected: ${client.id} for user ${user.id}`);
  }

  @SubscribeMessage('execute_query_response')
  public async queryResponse(client: Socket, payload: any) {
    global.console.log('payload', payload);
  }

  /**
   * broadcast the data to the entire room participants
   * @param {string} room
   * @param {string} event
   * @param {*} data
   * @memberof MessageGateway
   */
  public async broadcastToRomm(room: string, event: string, data: any) {
    await this.server.to(room).emit(event, data);
  }

  @SubscribeMessage('join_room')
  public async setTransactionDelivery(client: Socket, payload: any) {
    client.join(payload.room);
    client.emit('room.joined', payload);
  }

  @SubscribeMessage('broadcast_room')
  public async testBroadcast(client: Socket, payload: { room: string; data: any }) {
    await this.server.to(payload.room).emit('log', payload.data);
  }

  /**
   * event to capture whenever socket server is initialized
   * @param {Server} server
   * @return {*}  {void}
   * @memberof MessageGateway
   */
  public afterInit(server: Server): void {
    return this.logger.log('Init');
  }

  /**
   * event captured whenever a given socket is disconnected
   * @param {Socket} client
   * @return {*}  {void}
   * @memberof MessageGateway
   */
  public handleDisconnect(client: Socket): void {
    return this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * event captured whenever a given socket is connected
   * @param {Socket} client
   * @return {*}  {void}
   * @memberof MessageGateway
   */
  public handleConnection(client: Socket): void {
    client.emit('on_successful_connection', {});
    return this.logger.log(`Client connected: ${client.id}`);
  }

  public async broadcastToRoom(room: string, event: string, data: any) {
    await this.server.to(room).emit(event, data);
  }
}
